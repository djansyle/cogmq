import assert from 'assert';
import RmqConnection from './connection';

/**
 * RabbitMQ Consumer Class
 */
export default class CogServer {
  constructor(option = { concurrency: false }) {
    const channelType = typeof option.queue;
    assert(channelType === 'string', `Expecting 'channel' as a string but got ${channelType}.`);

    this.option = option;
    this.connections = [];
  }

  get queue() {
    return this.option.queue;
  }

  /**
   * Adds a new worker of the same channel.
   * @param fn
   */
  async addWorker(fn) {
    const fnType = typeof fn;
    assert(fnType === 'function', `Expecting 'fn' to be a function but got ${fnType}.`);
    const connection = await (new RmqConnection(this.option).initializeConnection());
    const channel = await connection.getChannel();

    await channel.assertQueue(this.option.queue, { durable: false });
    await channel.prefetch(this.option.concurrency);
    const { consumerTag } = await channel.consume(this.option.queue, async (msg) => {
      if (msg === null) {
        return;
      }

      let result = null;
      try {
        const { payload } = JSON.parse(msg.content.toString());
        result = { payload: await fn(payload) };
      } catch (error) {
        if (error instanceof SyntaxError) {
          result = { error: { code: 'PARSE_ERROR', args: { stack: error.stack } } };
        } else {
          result = { error };
        }
      }

      const { correlationId } = msg.properties;
      await channel.sendToQueue(msg.properties.replyTo, new Buffer(JSON.stringify(result)), { correlationId });
      channel.ack(msg);
    });

    this.connections.push({ channel, consumerTag });
    return consumerTag;
  }

  /**
   * Closes all the connection that has been made.
   */
  async stop() {
    await Promise.all(this.connections.map(async ({ channel, consumerTag }) => {
      // We just let know that the channel is already closed, considering the connection is also closed.
      channel.cancel(consumerTag);

      // Will cause on error see: https://github.com/squaremo/amqp.node/issues/250
      // Instead we delete the channel and connection right away.
      // await channel.close();
      // connection.close();
    }));
    delete this.connections;
  }
}
