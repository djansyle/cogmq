import assert from 'assert';
import { v4 } from 'uuid';
import debug from 'debug';
import RmqConnection from './connection';

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
export default class RmqClient {
  constructor(option) {
    const queue = typeof option.queue;
    assert(queue === 'string', `Expecting 'queue' as a string but got ${queue}.`);

    this.option = Object.assign({}, { timeout: 5000 }, option );
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
      const { correlationId } = msg.properties;
      const cb = this.messages.get(correlationId);
      if (!cb) {
        debug(`Message with id ${correlationId} arrived unexpectedly.`);
        return;
      }

      cb(JSON.parse(msg.content.toString()));
    }, { noAck: true });

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

      this.messages.set(correlationId, (reply) => {
        clearTimeout(timeout);
        if (reply.error) {
          const { message } = reply.error;
          reject(Object.assign(new Error(message), { error: reply.error }));
          return;
        }

        this.messages.delete(correlationId);
        resolve(reply.payload);
      });
    });

    await this.channel.sendToQueue(
      this.option.queue,
      new Buffer(JSON.stringify({ payload: msg })),
      { correlationId, replyTo: this.queue.queue },
    );

    return promise;
  }
}
