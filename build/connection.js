'use strict';Object.defineProperty(exports, "__esModule", { value: true });var _amqplib = require('amqplib');var _amqplib2 = _interopRequireDefault(_amqplib);function _interopRequireDefault(obj) {return obj && obj.__esModule ? obj : { default: obj };}function _asyncToGenerator(fn) {return function () {var gen = fn.apply(this, arguments);return new Promise(function (resolve, reject) {function step(key, arg) {try {var info = gen[key](arg);var value = info.value;} catch (error) {reject(error);return;}if (info.done) {resolve(value);} else {return Promise.resolve(value).then(function (value) {step("next", value);}, function (err) {step("throw", err);});}}return step("next");});};}
/**
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                              * RabbitMQ Connection Class
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                              */
class CogConnection {
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
  initializeConnection() {var _this = this;return _asyncToGenerator(function* () {
      _this.connection = yield _amqplib2.default.connect(_this.option.url);
      return _this;})();
  }

  /**
     * Gets a new channel based on the current connection.
     * @returns {Promise.<*>}
     */
  getChannel() {var _this2 = this;return _asyncToGenerator(function* () {
      return _this2.connection.createChannel();})();
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
  }}exports.default = CogConnection;