import assert from 'assert';
import RmqConnection from './connection';
import CogError from './error';
import { server as logger } from './logger';

function isJavascriptError(error) {
  return error instanceof RangeError ||
    error instanceof SyntaxError ||
    error instanceof TypeError ||
    error instanceof URIError ||
    error instanceof EvalError; // Plain Error object, not the one that is being inherited.
}

/**
 * RabbitMQ Consumer Class
 */
export default class CogServer {
  constructor(option = { concurrency: false }) {
    const channelType = typeof option.queue;
    assert(channelType === 'string', `Expecting 'channel' as a string but got ${channelType}.`);

    this.option = option;
    this.connections = [];
    this.errorHandler = null;
  }

  setErrorHandler(fn) {
    assert(typeof fn === 'function', 'Expecting error handler to be a function');
    this.errorHandler = fn;
  }

  get queue() {
    return this.option.queue;
  }

  /**
   * Adds a new worker of the same channel.
   * @param fn
   */
  async addWorker(fn) {
    logger.info({ queue: this.option.queue, message: 'Attaching worker.' });
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

      const content = msg.content.toString();
      logger.inbound({ queue: this.option.queue, content });
      let result = null;
      try {
        const { payload } = JSON.parse(content);
        result = { payload: await fn(payload) };
      } catch (error) {
        logger.error({ queue: this.option.queue, error });
        const handlerResult = this.errorHandler ? this.errorHandler(error) : null;

        if (error instanceof SyntaxError) {
          result = {
            error: {
              code: 'PARSE_ERROR',
              description: 'Invalid JSON format.',
              meta: {
                message: content,
              },
            },
          };
          // Try if there is a result from errorHandler built in.
        } else if (handlerResult) {
          result = handlerResult;

          // Default handler for all CogError
        } else if (error instanceof CogError) {
          result = { error: error.toJSON() };

          // A programmer error
        } else if (isJavascriptError(error)) {
          result = { error: { code: 'INTERNAL_ERROR', description: 'Something went wrong with the server.' } };

          // I don't know error.
        } else {
          result = { error };
        }
      }

      const { correlationId } = msg.properties;
      await channel.sendToQueue(msg.properties.replyTo, new Buffer(JSON.stringify(result)), { correlationId });
      logger.outbound({ queue: this.option.queue, correlationId, content: result, type: typeof result });
      channel.ack(msg);
    });

    this.connections.push({ channel, consumerTag });
    return consumerTag;
  }

  /**
   * Closes all the connection that has been made.
   */
  async stop() {
    logger.info({ queue: this.option.queue, message: 'Stopping server.' });
    await Promise.all(this.connections.map(async ({ channel, consumerTag }) => {
      // We just let know that the channel is already closed, considering the connection is also closed.
      channel.cancel(consumerTag);

      // Will cause on error see: https://github.com/squaremo/amqp.node/issues/250
      // Instead we delete the channel and connection right away.
      // await channel.close();
      // connection.close();
    }));
    delete this.connections;
    logger.info({ queue: this.option.queue, message: 'Server stopped' });
  }
}
