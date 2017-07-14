import amqplib from 'amqplib';
/**
 * RabbitMQ Connection Class
 */
export default class CogConnection {
  /**
   * @param {Object} option
   * @param {String} [option.url]
   */
  constructor(option) {
    this.option = Object.assign(option || {}, {
      host: 'localhost',
      port: 5672,
      login: 'guest',
      password: 'guest',
      vhost: '/',
    });
    this.connection = null;
  }

  /**
   * Gets a new connection.
   * @returns {Promise.<*>}
   */
  async initializeConnection() {
    const option = this.option;
    const auth = option.login || (typeof option === 'string' && option.login !== '') ?
      `${option.login}:${option.password}@` : '';
    const url = `amqp://${auth}${option.host}:${option.port}/${option.vhost}`;
    this.connection = await amqplib.connect(url);
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

  close() {
    this.connection.close();
  }
}
