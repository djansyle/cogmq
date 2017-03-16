import amqplib from 'amqplib';
/**
 * RabbitMQ Connection Class
 */
export default class RmqConnection {
  /**
   * @param {Object} option
   * @param {String} [option.url]
   */
  constructor(option = { url: 'aqmp://localhost' }) {
    this.option = option;

    if (typeof option === 'string') {
      this.option = { url: option };
    }

    this.connection = null;
  }

  /**
   * Gets a new connection.
   * @returns {Promise.<*>}
   */
  async initializeConnection() {
    this.connection = await amqplib.connect(this.option.url);
    return this;
  }

  /**
   * Gets a new channel based on the current connection.
   * @returns {Promise.<*>}
   */
  async getChannel() {
    return this.connection.createChannel();
  }

  /**
   * Proxy function for `on`.
   * @param event
   * @param fn
   */
  on(event, fn) {
    this.connection.on(event, fn);
  }
}
