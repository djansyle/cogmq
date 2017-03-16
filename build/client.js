'use strict';Object.defineProperty(exports, "__esModule", { value: true });var _assert = require('assert');var _assert2 = _interopRequireDefault(_assert);
var _uuid = require('uuid');
var _debug = require('debug');var _debug2 = _interopRequireDefault(_debug);
var _connection = require('./connection');var _connection2 = _interopRequireDefault(_connection);function _interopRequireDefault(obj) {return obj && obj.__esModule ? obj : { default: obj };}function _asyncToGenerator(fn) {return function () {var gen = fn.apply(this, arguments);return new Promise(function (resolve, reject) {function step(key, arg) {try {var info = gen[key](arg);var value = info.value;} catch (error) {reject(error);return;}if (info.done) {resolve(value);} else {return Promise.resolve(value).then(function (value) {step("next", value);}, function (err) {step("throw", err);});}}return step("next");});};}

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
class RmqClient {
  constructor(option) {
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
          const { correlationId } = msg.properties;
          const cb = _this.messages.get(correlationId);
          if (!cb) {
            (0, _debug2.default)(`Message with id ${correlationId} arrived unexpectedly.`);
            return;
          }

          cb(JSON.parse(msg.content.toString()));
        });return function (_x) {return _ref.apply(this, arguments);};})(), { noAck: true });

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

        _this2.messages.set(correlationId, function (reply) {
          clearTimeout(timeout);
          if (reply.error) {
            const { message } = reply.error;
            reject(Object.assign(new Error(message), { error: reply.error }));
            return;
          }

          _this2.messages.delete(correlationId);
          resolve(reply.payload);
        });
      });

      yield _this2.channel.sendToQueue(
      _this2.option.queue,
      new Buffer(JSON.stringify({ payload: msg })),
      { correlationId, replyTo: _this2.queue.queue });


      return promise;})();
  }}exports.default = RmqClient;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uL3NyYy9jbGllbnQuanMiXSwibmFtZXMiOlsidXVpZFY0IiwicmVwbGFjZSIsIlJtcUNsaWVudCIsImNvbnN0cnVjdG9yIiwib3B0aW9uIiwicXVldWUiLCJPYmplY3QiLCJhc3NpZ24iLCJ0aW1lb3V0IiwibWVzc2FnZXMiLCJNYXAiLCJjb25uZWN0aW9uIiwiY2hhbm5lbCIsImluaXRpYWxpemUiLCJpbml0aWFsaXplQ29ubmVjdGlvbiIsImdldENoYW5uZWwiLCJxIiwiYXNzZXJ0UXVldWUiLCJleGNsdXNpdmUiLCJjb25zdW1lIiwibXNnIiwiY29ycmVsYXRpb25JZCIsInByb3BlcnRpZXMiLCJjYiIsImdldCIsIkpTT04iLCJwYXJzZSIsImNvbnRlbnQiLCJ0b1N0cmluZyIsIm5vQWNrIiwic2VuZCIsInByb21pc2UiLCJQcm9taXNlIiwicmVzb2x2ZSIsInJlamVjdCIsInNldFRpbWVvdXQiLCJlcnJvciIsIkVycm9yIiwiZGVsZXRlIiwiY29kZSIsInBheWxvYWQiLCJzZXQiLCJyZXBseSIsImNsZWFyVGltZW91dCIsIm1lc3NhZ2UiLCJzZW5kVG9RdWV1ZSIsIkJ1ZmZlciIsInN0cmluZ2lmeSIsInJlcGx5VG8iXSwibWFwcGluZ3MiOiIyRUFBQSxnQztBQUNBO0FBQ0EsOEI7QUFDQSwwQzs7QUFFQTs7OztBQUlBLFNBQVNBLE1BQVQsR0FBa0I7QUFDaEIsU0FBTyxnQkFBS0MsT0FBTCxDQUFhLElBQWIsRUFBbUIsRUFBbkIsQ0FBUDtBQUNEOztBQUVEOzs7QUFHZSxNQUFNQyxTQUFOLENBQWdCO0FBQzdCQyxjQUFZQyxNQUFaLEVBQW9CO0FBQ2xCLFVBQU1DLFFBQVEsT0FBT0QsT0FBT0MsS0FBNUI7QUFDQSwwQkFBT0EsVUFBVSxRQUFqQixFQUE0Qix5Q0FBd0NBLEtBQU0sR0FBMUU7O0FBRUEsU0FBS0QsTUFBTCxHQUFjRSxPQUFPQyxNQUFQLENBQWMsRUFBZCxFQUFrQixFQUFFQyxTQUFTLElBQVgsRUFBbEIsRUFBcUNKLE1BQXJDLENB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LEMsa0JBQVY3QixTIiwiZmlsZSI6ImNsaWVudC5qcyIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCBhc3NlcnQgZnJvbSAnYXNzZXJ0JztcbmltcG9ydCB7IHY0IH0gZnJvbSAndXVpZCc7XG5pbXBvcnQgZGVidWcgZnJvbSAnZGVidWcnO1xuaW1wb3J0IFJtcUNvbm5lY3Rpb24gZnJvbSAnLi9jb25uZWN0aW9uJztcblxuLyoqXG4gKiBHZW5lcmF0ZXMgYW4gdXVpZFY0IHdpdGggbm8gaHlwaGVuKC0pO1xuICogQHJldHVybnMge3N0cmluZ3xYTUx8dm9pZHwqfVxuICovXG5mdW5jdGlvbiB1dWlkVjQoKSB7XG4gIHJldHVybiB2NCgpLnJlcGxhY2UoLy0vZywgJycpO1xufVxuXG4vKipcbiAqIFJhYmJpdE1RIENsaWVudCBDbGFzc1xuICovXG5leHBvcnQgZGVmYXVsdCBjbGFzcyBSbXFDbGllbnQge1xuICBjb25zdHJ1Y3RvcihvcHRpb24pIHtcbiAgICBjb25zdCBxdWV1ZSA9IHR5cGVvZiBvcHRpb24ucXVldWU7XG4gICAgYXNzZXJ0KHF1ZXVlID09PSAnc3RyaW5nJywgYEV4cGVjdGluZyAncXVldWUnIGFzIGEgc3RyaW5nIGJ1dCBnb3QgJHtxdWV1ZX0uYCk7XG5cbiAgICB0aGlzLm9wdGlvbiA9IE9iamVjdC5hc3NpZ24oe30sIHsgdGltZW91dDogNTAwMCB9LCBvcHRpb24gKTtcbiAgICB0aGlzLm1lc3NhZ2VzID0gbmV3IE1hcCgpO1xuICAgIHRoaXMuY29ubmVjdGlvbiA9IG51bGw7XG4gICAgdGhpcy5jaGFubmVsID0gbnVsbDtcbiAgICB0aGlzLnF1ZXVlID0gbnVsbDtcbiAgfVxuXG4gIC8qKlxuICAgKiBJbml0aWFsaXplIG9iamVjdHMuXG4gICAqIEByZXR1cm5zIHtQcm9taXNlLjx2b2lkPn1cbiAgICovXG4gIGFzeW5jIGluaXRpYWxpemUoKSB7XG4gICAgdGhpcy5jb25uZWN0aW9uID0gYXdhaXQgbmV3IFJtcUNvbm5lY3Rpb24odGhpcy5vcHRpb24pLmluaXRpYWxpemVDb25uZWN0aW9uKCk7XG4gICAgY29uc3QgY2hhbm5lbCA9IGF3YWl0IHRoaXMuY29ubmVjdGlvbi5nZXRDaGFubmVsKCk7XG5cbiAgICBjb25zdCBxID0gYXdhaXQgY2hhbm5lbC5hc3NlcnRRdWV1ZSgnJywgeyBleGNsdXNpdmU6IHRydWUgfSk7XG4gICAgY2hhbm5lbC5jb25zdW1lKHEucXVldWUsIGFzeW5jIChtc2cpID0+IHtcbiAgICAgIGNvbnN0IHsgY29ycmVsYXRpb25JZCB9ID0gbXNnLnByb3BlcnRpZXM7XG4gICAgICBjb25zdCBjYiA9IHRoaXMubWVzc2FnZXMuZ2V0KGNvcnJlbGF0aW9uSWQpO1xuICAgICAgaWYgKCFjYikge1xuICAgICAgICBkZWJ1ZyhgTWVzc2FnZSB3aXRoIGlkICR7Y29ycmVsYXRpb25JZH0gYXJyaXZlZCB1bmV4cGVjdGVkbHkuYCk7XG4gICAgICAgIHJldHVybjtcbiAgICAgIH1cblxuICAgICAgY2IoSlNPTi5wYXJzZShtc2cuY29udGVudC50b1N0cmluZygpKSk7XG4gICAgfSwgeyBub0FjazogdHJ1ZSB9KTtcblxuICAgIHRoaXMuY2hhbm5lbCA9IGNoYW5uZWw7XG4gICAgdGhpcy5xdWV1ZSA9IHE7XG4gIH1cblxuICAvKipcbiAgICogU2VuZHMgdGhlIG9iamVjdCB0YXNrIHRvIHRoZSBxdWVxdWUuXG4gICAqIEBwYXJhbSBtc2dcbiAgICogQHJldHVybnMge1Byb21pc2UuPHZvaWQ+fVxuICAgKi9cbiAgYXN5bmMgc2VuZChtc2cpIHtcbiAgICBpZiAoIXRoaXMuY29ubmVjdGlvbikge1xuICAgICAgYXdhaXQgdGhpcy5pbml0aWFsaXplKCk7XG4gICAgfVxuXG4gICAgY29uc3QgY29ycmVsYXRpb25JZCA9IHV1aWRWNCgpO1xuICAgIGNvbnN0IHByb21pc2UgPSBuZXcgUHJvbWlzZSgocmVzb2x2ZSwgcmVqZWN0KSA9PiB7XG4gICAgICBjb25zdCB0aW1lb3V0ID0gc2V0VGltZW91dCgoKSA9PiB7XG4gICAgICAgIGNvbnN0IGVycm9yID0gbmV3IEVycm9yKCdXYWl0aW5nIHRpbWUgcmVhY2ggdG8gdGhlIG1heGltdW0gdGhyZXNob2xkLicpO1xuICAgICAgICB0aGlzLm1lc3NhZ2VzLmRlbGV0ZShjb3JyZWxhdGlvbklkKTtcblxuICAgICAgICByZWplY3QoT2JqZWN0LmFzc2lnbihlcnJvciwgeyBjb3JyZWxhdGlvbklkLCBjb2RlOiAnRV9USU1FT1VUJywgcGF5bG9hZDogbXNnIH0pKTtcbiAgICAgIH0sIHRoaXMub3B0aW9uLnRpbWVvdXQpO1xuXG4gICAgICB0aGlzLm1lc3NhZ2VzLnNldChjb3JyZWxhdGlvbklkLCAocmVwbHkpID0+IHtcbiAgICAgICAgY2xlYXJUaW1lb3V0KHRpbWVvdXQpO1xuICAgICAgICBpZiAocmVwbHkuZXJyb3IpIHtcbiAgICAgICAgICBjb25zdCB7IG1lc3NhZ2UgfSA9IHJlcGx5LmVycm9yO1xuICAgICAgICAgIHJlamVjdChPYmplY3QuYXNzaWduKG5ldyBFcnJvcihtZXNzYWdlKSwgeyBlcnJvcjogcmVwbHkuZXJyb3IgfSkpO1xuICAgICAgICAgIHJldHVybjtcbiAgICAgICAgfVxuXG4gICAgICAgIHRoaXMubWVzc2FnZXMuZGVsZXRlKGNvcnJlbGF0aW9uSWQpO1xuICAgICAgICByZXNvbHZlKHJlcGx5LnBheWxvYWQpO1xuICAgICAgfSk7XG4gICAgfSk7XG5cbiAgICBhd2FpdCB0aGlzLmNoYW5uZWwuc2VuZFRvUXVldWUoXG4gICAgICB0aGlzLm9wdGlvbi5xdWV1ZSxcbiAgICAgIG5ldyBCdWZmZXIoSlNPTi5zdHJpbmdpZnkoeyBwYXlsb2FkOiBtc2cgfSkpLFxuICAgICAgeyBjb3JyZWxhdGlvbklkLCByZXBseVRvOiB0aGlzLnF1ZXVlLnF1ZXVlIH0sXG4gICAgKTtcblxuICAgIHJldHVybiBwcm9taXNlO1xuICB9XG59XG4iXX0=