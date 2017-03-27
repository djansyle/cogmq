import assert from 'assert';
import { v4 } from 'uuid';
import debug from 'debug';
import RmqConnection from './connection';
import ConvertableError from './convertableError';

/**
 * Generates an uuidV4 with no hyphen(-);
 * @returns {string|XML|void|*}
 */
function uuidV4() {
  return v4().replace(/-/g, '');
}

/**
 * RabbitMQ Client Class
 */
export default class RmqClient extends ConvertableError {
  constructor(option) {
    super(option.errorMap);
    const queue = typeof option.queue;
    assert(queue === 'string', `Expecting 'queue' as a string but got ${queue}.`);

    this.option = Object.assign({}, { timeout: 5000 }, option);
    this.messages = new Map();
    this.connection = null;
    this.channel = null;
    this.queue = null;
  }

  /**
   * Initialize objects.
   * @returns {Promise.<void>}
   */
  async initialize() {
    this.connection = await new RmqConnection(this.option).initializeConnection();
    const channel = await this.connection.getChannel();

    const q = await channel.assertQueue('', { exclusive: true });
    channel.consume(q.queue, async (msg) => {
      channel.ack(msg);
      const { correlationId } = msg.properties;
      const cb = this.messages.get(correlationId);
      if (!cb) {
        debug(`Message with id ${correlationId} arrived unexpectedly.`);
        return;
      }

      cb(JSON.parse(msg.content.toString()));
    });

    this.channel = channel;
    this.queue = q;
  }

  /**
   * Sends the object task to the queque.
   * @param msg
   * @returns {Promise.<void>}
   */
  async send(msg) {
    if (!this.connection) {
      await this.initialize();
    }

    const correlationId = uuidV4();
    const promise = new Promise((resolve, reject) => {
      const timeout = setTimeout(() => {
        const error = new Error('Waiting time reach to the maximum threshold.');
        this.messages.delete(correlationId);

        reject(Object.assign(error, { correlationId, code: 'E_TIMEOUT', payload: msg }));
      }, this.option.timeout);

      this.messages.set(correlationId, ({ error, payload }) => {
        clearTimeout(timeout);
        this.messages.delete(correlationId);

        if (error) {
          const { code } = error;
          if (!this.hasError(code)) {
            reject(Object.assign(new Error(code), error));
            return;
          }
          reject(this.error.call(this, code, error.args));
          return;
        }

        resolve(payload);
      });
    });

    await this.channel.sendToQueue(
      this.option.queue,
      new Buffer(JSON.stringify({ payload: msg })),
      { correlationId, replyTo: this.queue.queue },
    );

    return promise;
  }

  async stop() {
    await this.channel.close();
    this.connection.close();
    delete this.connection;
  }
}
