import assert from 'assert';
import RmqConnection from './connection';

/**
 * RabbitMQ Consumer Class
 */
export default class RmqServer {
  constructor(option = { durable: false }) {
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
    await channel.prefetch(1);
    const { consumerTag } = channel.consume(this.option.channel, async (msg) => {
      if (msg === null) {
        return;
      }

      let result = null;
      try {
        const { payload } = JSON.parse(msg.content.toString());
        result = { payload: await fn(payload) };
      } catch (error) {
        result = { error };
      }

      const { correlationId } = msg.properties;
      await channel.sendToQueue(msg.properties.replyTo, new Buffer(JSON.stringify(result)), { correlationId });
      channel.ack(msg);
    });

    connection.on('close', () => channel.cancel(consumerTag));
    this.connections.push(connection);
    return consumerTag;
  }

  /**
   * Closes all the connection that has been made.
   */
  async stop() {
    await this.connections.map(conn => conn.close());
    delete this.connections;
  }
}
