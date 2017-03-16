'use strict';Object.defineProperty(exports, "__esModule", { value: true });var _amqplib = require('amqplib');var _amqplib2 = _interopRequireDefault(_amqplib);function _interopRequireDefault(obj) {return obj && obj.__esModule ? obj : { default: obj };}function _asyncToGenerator(fn) {return function () {var gen = fn.apply(this, arguments);return new Promise(function (resolve, reject) {function step(key, arg) {try {var info = gen[key](arg);var value = info.value;} catch (error) {reject(error);return;}if (info.done) {resolve(value);} else {return Promise.resolve(value).then(function (value) {step("next", value);}, function (err) {step("throw", err);});}}return step("next");});};}
/**
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                              * RabbitMQ Connection Class
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                              */
class RmqConnection {
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
  }}exports.default = RmqConnection;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uL3NyYy9jb25uZWN0aW9uLmpzIl0sIm5hbWVzIjpbIlJtcUNvbm5lY3Rpb24iLCJjb25zdHJ1Y3RvciIsIm9wdGlvbiIsInVybCIsImNvbm5lY3Rpb24iLCJpbml0aWFsaXplQ29ubmVjdGlvbiIsImNvbm5lY3QiLCJnZXRDaGFubmVsIiwiY3JlYXRlQ2hhbm5lbCIsIm9uIiwiZXZlbnQiLCJmbiJdLCJtYXBwaW5ncyI6IjJFQUFBLGtDO0FBQ0E7OztBQUdlLE1BQU1BLGFBQU4sQ0FBb0I7QUFDakM7Ozs7QUFJQUMsY0FBWUMsU0FBUyxFQUFFQyxLQUFLLGtCQUFQLEVBQXJCLEVBQWtEO0FBQ2hELFNBQUtELE1BQUwsR0FBY0EsTUFBZDs7QUFFQSxRQUFJLE9BQU9BLE1BQVAsS0FBa0IsUUFBdEIsRUFBZ0M7QUFDOUIsV0FBS0EsTUFBTCxHQUFjLEVBQUVDLEtBQUtELE1BQVAsRUFBZDtBQUNEOztBQUVELFNBQUtFLFVBQUwsR0FBa0IsSUFBbEI7QUFDRDs7QUFFRDs7OztBQUlNQyxzQkFBTixHQUE2QjtBQUMzQixZQUFLRCxVQUFMLEdBQWtCLE1BQU0sa0JBQVFFLE9BQVIsQ0FBZ0IsTUFBS0osTUFBTCxDQUFZQyxHQUE1QixDQUF4QjtBQUNBLG1CQUYyQjtBQUc1Qjs7QUFFRDs7OztBQUlNSSxZQUFOLEdBQW1CO0FBQ2pCLGFBQU8sT0FBS0gsVUFBTCxDQUFnQkksYUFBaEIsRUFBUCxDQURpQjtBQUVsQjs7QUFFRDs7Ozs7QUFLQUMsS0FBR0MsS0FBSCxFQUFVQyxFQUFWLEVBQWM7QUFDWixTQUFLUCxVQUFMLENBQWdCSyxFQUFoQixDQUFtQkMsS0FBbkIsRUFBMEJDLEVBQTFCO0FBQ0QsR0F2Q2dDLEMsa0JBQWRYLGEiLCJmaWxlIjoiY29ubmVjdGlvbi5qcyIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCBhbXFwbGliIGZyb20gJ2FtcXBsaWInO1xuLyoqXG4gKiBSYWJiaXRNUSBDb25uZWN0aW9uIENsYXNzXG4gKi9cbmV4cG9ydCBkZWZhdWx0IGNsYXNzIFJtcUNvbm5lY3Rpb24ge1xuICAvKipcbiAgICogQHBhcmFtIHtPYmplY3R9IG9wdGlvblxuICAgKiBAcGFyYW0ge1N0cmluZ30gW29wdGlvbi51cmxdXG4gICAqL1xuICBjb25zdHJ1Y3RvcihvcHRpb24gPSB7IHVybDogJ2FxbXA6Ly9sb2NhbGhvc3QnIH0pIHtcbiAgICB0aGlzLm9wdGlvbiA9IG9wdGlvbjtcblxuICAgIGlmICh0eXBlb2Ygb3B0aW9uID09PSAnc3RyaW5nJykge1xuICAgICAgdGhpcy5vcHRpb24gPSB7IHVybDogb3B0aW9uIH07XG4gICAgfVxuXG4gICAgdGhpcy5jb25uZWN0aW9uID0gbnVsbDtcbiAgfVxuXG4gIC8qKlxuICAgKiBHZXRzIGEgbmV3IGNvbm5lY3Rpb24uXG4gICAqIEByZXR1cm5zIHtQcm9taXNlLjwqPn1cbiAgICovXG4gIGFzeW5jIGluaXRpYWxpemVDb25uZWN0aW9uKCkge1xuICAgIHRoaXMuY29ubmVjdGlvbiA9IGF3YWl0IGFtcXBsaWIuY29ubmVjdCh0aGlzLm9wdGlvbi51cmwpO1xuICAgIHJldHVybiB0aGlzO1xuICB9XG5cbiAgLyoqXG4gICAqIEdldHMgYSBuZXcgY2hhbm5lbCBiYXNlZCBvbiB0aGUgY3VycmVudCBjb25uZWN0aW9uLlxuICAgKiBAcmV0dXJucyB7UHJvbWlzZS48Kj59XG4gICAqL1xuICBhc3luYyBnZXRDaGFubmVsKCkge1xuICAgIHJldHVybiB0aGlzLmNvbm5lY3Rpb24uY3JlYXRlQ2hhbm5lbCgpO1xuICB9XG5cbiAgLyoqXG4gICAqIFByb3h5IGZ1bmN0aW9uIGZvciBgb25gLlxuICAgKiBAcGFyYW0gZXZlbnRcbiAgICogQHBhcmFtIGZuXG4gICAqL1xuICBvbihldmVudCwgZm4pIHtcbiAgICB0aGlzLmNvbm5lY3Rpb24ub24oZXZlbnQsIGZuKTtcbiAgfVxufVxuIl19