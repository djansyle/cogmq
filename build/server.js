'use strict';Object.defineProperty(exports, "__esModule", { value: true });var _assert = require('assert');var _assert2 = _interopRequireDefault(_assert);
var _connection = require('./connection');var _connection2 = _interopRequireDefault(_connection);function _interopRequireDefault(obj) {return obj && obj.__esModule ? obj : { default: obj };}function _asyncToGenerator(fn) {return function () {var gen = fn.apply(this, arguments);return new Promise(function (resolve, reject) {function step(key, arg) {try {var info = gen[key](arg);var value = info.value;} catch (error) {reject(error);return;}if (info.done) {resolve(value);} else {return Promise.resolve(value).then(function (value) {step("next", value);}, function (err) {step("throw", err);});}}return step("next");});};}

/**
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                 * RabbitMQ Consumer Class
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                 */
class RmqServer {
  constructor(option = { concurrency: false }) {
    const channelType = typeof option.queue;
    (0, _assert2.default)(channelType === 'string', `Expecting 'channel' as a string but got ${channelType}.`);

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
  addWorker(fn) {var _this = this;return _asyncToGenerator(function* () {
      const fnType = typeof fn;
      (0, _assert2.default)(fnType === 'function', `Expecting 'fn' to be a function but got ${fnType}.`);
      const connection = yield new _connection2.default(_this.option).initializeConnection();
      const channel = yield connection.getChannel();

      yield channel.assertQueue(_this.option.queue, { durable: false });
      yield channel.prefetch(_this.option.concurrency);
      const { consumerTag } = yield channel.consume(_this.option.queue, (() => {var _ref = _asyncToGenerator(function* (msg) {
          if (msg === null) {
            return;
          }

          let result = null;
          try {
            const { payload } = JSON.parse(msg.content.toString());
            result = { payload: yield fn(payload) };
          } catch (error) {
            result = { error };
          }

          const { correlationId } = msg.properties;
          yield channel.sendToQueue(msg.properties.replyTo, new Buffer(JSON.stringify(result)), { correlationId });
          channel.ack(msg);
        });return function (_x) {return _ref.apply(this, arguments);};})());

      _this.connections.push({ channel, consumerTag });
      return consumerTag;})();
  }

  /**
     * Closes all the connection that has been made.
     */
  stop() {var _this2 = this;return _asyncToGenerator(function* () {
      yield Promise.all(_this2.connections.map((() => {var _ref2 = _asyncToGenerator(function* ({ channel, consumerTag }) {
          // We just let know that the channel is already closed, considering the connection is also closed.
          channel.cancel(consumerTag);

          // Will cause on error see: https://github.com/squaremo/amqp.node/issues/250
          // Instead we delete the channel and connection right away.
          // await channel.close();
          // connection.close();
        });return function (_x2) {return _ref2.apply(this, arguments);};})()));
      delete _this2.connections;})();
  }}exports.default = RmqServer;