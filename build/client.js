'use strict';Object.defineProperty(exports, "__esModule", { value: true });var _assert = require('assert');var _assert2 = _interopRequireDefault(_assert);
var _uuid = require('uuid');
var _debug = require('debug');var _debug2 = _interopRequireDefault(_debug);
var _connection = require('./connection');var _connection2 = _interopRequireDefault(_connection);
var _convertableError = require('./convertableError');var _convertableError2 = _interopRequireDefault(_convertableError);function _interopRequireDefault(obj) {return obj && obj.__esModule ? obj : { default: obj };}function _asyncToGenerator(fn) {return function () {var gen = fn.apply(this, arguments);return new Promise(function (resolve, reject) {function step(key, arg) {try {var info = gen[key](arg);var value = info.value;} catch (error) {reject(error);return;}if (info.done) {resolve(value);} else {return Promise.resolve(value).then(function (value) {step("next", value);}, function (err) {step("throw", err);});}}return step("next");});};}

/**
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                         * Generates an uuidV4 with no hyphen(-);
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                         * @returns {string|XML|void|*}
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                         */
function uuidV4() {
  return (0, _uuid.v4)().replace(/-/g, '');
}

/**
   * RabbitMQ Client Class
   */
class RmqClient extends _convertableError2.default {
  constructor(option) {
    super(option.errorMap);
    const queue = typeof option.queue;
    (0, _assert2.default)(queue === 'string', `Expecting 'queue' as a string but got ${queue}.`);

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
  initialize() {var _this = this;return _asyncToGenerator(function* () {
      _this.connection = yield new _connection2.default(_this.option).initializeConnection();
      const channel = yield _this.connection.getChannel();

      const q = yield channel.assertQueue('', { exclusive: true });
      channel.consume(q.queue, (() => {var _ref = _asyncToGenerator(function* (msg) {
          channel.ack(msg);
          const { correlationId } = msg.properties;
          const cb = _this.messages.get(correlationId);
          if (!cb) {
            (0, _debug2.default)(`Message with id ${correlationId} arrived unexpectedly.`);
            return;
          }

          cb(JSON.parse(msg.content.toString()));
        });return function (_x) {return _ref.apply(this, arguments);};})());

      _this.channel = channel;
      _this.queue = q;})();
  }

  /**
     * Sends the object task to the queque.
     * @param msg
     * @returns {Promise.<void>}
     */
  send(msg) {var _this2 = this;return _asyncToGenerator(function* () {
      if (!_this2.connection) {
        yield _this2.initialize();
      }

      const correlationId = uuidV4();
      const promise = new Promise(function (resolve, reject) {
        const timeout = setTimeout(function () {
          const error = new Error('Waiting time reach to the maximum threshold.');
          _this2.messages.delete(correlationId);

          reject(Object.assign(error, { correlationId, code: 'E_TIMEOUT', payload: msg }));
        }, _this2.option.timeout);

        _this2.messages.set(correlationId, function ({ error, payload }) {
          clearTimeout(timeout);
          _this2.messages.delete(correlationId);

          if (error) {
            const { code } = error;
            if (!_this2.hasError(code)) {
              reject(Object.assign(new Error(code), error));
              return;
            }
            reject(_this2.error.call(_this2, code, error.args));
            return;
          }

          resolve(payload);
        });
      });

      yield _this2.channel.sendToQueue(
      _this2.option.queue,
      new Buffer(JSON.stringify({ payload: msg })),
      { correlationId, replyTo: _this2.queue.queue });


      return promise;})();
  }

  stop() {var _this3 = this;return _asyncToGenerator(function* () {
      yield _this3.channel.close();
      _this3.connection.close();
      delete _this3.connection;})();
  }}exports.default = RmqClient;