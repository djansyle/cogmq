'use strict';Object.defineProperty(exports, "__esModule", { value: true });var _assert = require('assert');var _assert2 = _interopRequireDefault(_assert);
var _connection = require('./connection');var _connection2 = _interopRequireDefault(_connection);function _interopRequireDefault(obj) {return obj && obj.__esModule ? obj : { default: obj };}function _asyncToGenerator(fn) {return function () {var gen = fn.apply(this, arguments);return new Promise(function (resolve, reject) {function step(key, arg) {try {var info = gen[key](arg);var value = info.value;} catch (error) {reject(error);return;}if (info.done) {resolve(value);} else {return Promise.resolve(value).then(function (value) {step("next", value);}, function (err) {step("throw", err);});}}return step("next");});};}

/**
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                 * RabbitMQ Consumer Class
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                 */
class RmqServer {
  constructor(option = { durable: false }) {
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
      yield channel.prefetch(1);
      const { consumerTag } = channel.consume(_this.option.channel, (() => {var _ref = _asyncToGenerator(function* (msg) {
          if (msg === null) {
            return;
          }

          let result = null;
          try {
            const { payload } = JSON.parse(msg.content.toString());
            result = { payload: yield fn(payload) };
          } catch (e) {
            result = { error: { message: e.message, error: e } };
          }

          const { correlationId } = msg.properties;
          yield channel.sendToQueue(msg.properties.replyTo, new Buffer(JSON.stringify(result)), { correlationId });
          channel.ack(msg);
        });return function (_x) {return _ref.apply(this, arguments);};})());

      connection.on('close', function () {return channel.cancel(consumerTag);});
      _this.connections.push(connection);
      return consumerTag;})();
  }

  /**
     * Closes all the connection that has been made.
     */
  stop() {var _this2 = this;return _asyncToGenerator(function* () {
      yield _this2.connections.map(function (conn) {return conn.close();});
      delete _this2.connections;})();
  }}exports.default = RmqServer;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uL3NyYy9zZXJ2ZXIuanMiXSwibmFtZXMiOlsiUm1xU2VydmVyIiwiY29uc3RydWN0b3IiLCJvcHRpb24iLCJkdXJhYmxlIiwiY2hhbm5lbFR5cGUiLCJxdWV1ZSIsImNvbm5lY3Rpb25zIiwiYWRkV29ya2VyIiwiZm4iLCJmblR5cGUiLCJjb25uZWN0aW9uIiwiaW5pdGlhbGl6ZUNvbm5lY3Rpb24iLCJjaGFubmVsIiwiZ2V0Q2hhbm5lbCIsImFzc2VydFF1ZXVlIiwicHJlZmV0Y2giLCJjb25zdW1lclRhZyIsImNvbnN1bWUiLCJtc2ciLCJyZXN1bHQiLCJwYXlsb2FkIiwiSlNPTiIsInBhcnNlIiwiY29udGVudCIsInRvU3RyaW5nIiwiZSIsImVycm9yIiwibWVzc2FnZSIsImNvcnJlbGF0aW9uSWQiLCJwcm9wZXJ0aWVzIiwic2VuZFRvUXVldWUiLCJyZXBseVRvIiwiQnVmZmVyIiwic3RyaW5naWZ5IiwiYWNrIiwib24iLCJjYW5jZWwiLCJwdXNoIiwic3RvcCIsIm1hcCIsImNvbm4iLCJjbG9zZSJdLCJtYXBwaW5ncyI6IjJFQUFBLGdDO0FBQ0EsMEM7O0FBRUE7OztBQUdlLE1BQU1BLFNBQU4sQ0FBZ0I7QUFDN0JDLGNBQVlDLFNBQVMsRUFBRUMsU0FBUyxLQUFYLEVBQXJCLEVBQXlDO0FBQ3ZDLFVBQU1DLGNBQWMsT0FBT0YsT0FBT0csS0FBbEM7QUFDQSwwQkFBT0QsZ0JBQWdCLFFBQXZCLEVBQWtDLDJDQUEwQ0EsV0FBWSxHQUF4Rjs7QUFFQSxTQUFLRixNQUFMLEdBQWNBLE1BQWQ7QUFDQSxTQUFLSSxXQUFMLEdBQW1CLEVBQW5CO0FBQ0Q7O0FBRUQsTUFBSUQsS0FBSixHQUFZO0FBQ1YsV0FBTyxLQUFLSCxNQUFMLENBQVlHLEtBQW5CO0FBQ0Q7O0FBRUQ7Ozs7QUFJTUUsV0FBTixDQUFnQkMsRUFBaEIsRUFBb0I7QUFDbEIsWUFBTUMsU0FBUyxPQUFPRCxFQUF0QjtBQUNBLDRCQUFPQyxXQUFXLFVBQWxCLEVBQStCLDJDQUEwQ0EsTUFBTyxHQUFoRjtBQUNBLFlBQU1DLGFBQWEsTUFBTyx5QkFBa0IsTUFBS1IsTUFBdkIsRUFBK0JTLG9CQUEvQixFQUExQjtBQUNBLFlBQU1DLFVBQVUsTUFBTUYsV0FBV0csVUFBWCxFQUF0Qjs7QUFFQSxZQUFNRCxRQUFRRSxXQUFSLENBQW9CLE1BQUtaLE1BQUwsQ0FBWUcsS0FBaEMsRUFBdUMsRUFBRUYsU0FBUyxLQUFYLEVBQXZDLENBQU47QUFDQSxZQUFNUyxRQUFRRyxRQUFSLENBQWlCLENBQWpCLENBQU47QUFDQSxZQUFNLEVBQUVDLFdBQUYsS0FBa0JKLFFBQVFLLE9BQVIsQ0FBZ0IsTUFBS2YsTUFBTCxDQUFZVSxPQUE1Qix1Q0FBcUMsV0FBT00sR0FBUCxFQUFlO0FBQzFFLGNBQUlBLFFBQVEsSUFBWixFQUFrQjtBQUNoQjtBQUNEOztBQUVELGNBQUlDLFNBQVMsSUFBYjtBQUNBLGNBQUk7QUFDRixrQkFBTSxFQUFFQyxPQUFGLEtBQWNDLEtBQUtDLEtBQUwsQ0FBV0osSUFBSUssT0FBSixDQUFZQyxRQUFaLEVBQVgsQ0FBcEI7QUFDQUwscUJBQVMsRUFBRUMsU0FBUyxNQUFNWixHQUFHWSxPQUFILENBQWpCLEVBQVQ7QUFDRCxXQUhELENBR0UsT0FBT0ssQ0FBUCxFQUFVO0FBQ1ZOLHFCQUFTLEVBQUVPLE9BQU8sRUFBRUMsU0FBU0YsRUFBRUUsT0FBYixFQUFzQkQsT0FBT0QsQ0FBN0IsRUFBVCxFQUFUO0FBQ0Q7O0FBRUQsZ0JBQU0sRUFBRUcsYUFBRixLQUFvQlYsSUFBSVcsVUFBOUI7QUFDQSxnQkFBTWpCLFFBQVFrQixXQUFSLENBQW9CWixJQUFJVyxVQUFKLENBQWVFLE9BQW5DLEVBQTRDLElBQUlDLE1BQUosQ0FBV1gsS0FBS1ksU0FBTCxDQUFlZCxNQUFmLENBQVgsQ0FBNUMsRUFBZ0YsRUFBRVMsYUFBRixFQUFoRixDQUFOO0FBQ0FoQixrQkFBUXNCLEdBQVIsQ0FBWWhCLEdBQVo7QUFDRCxTQWhCdUIsa0VBQXhCOztBQWtCQVIsaUJBQVd5QixFQUFYLENBQWMsT0FBZCxFQUF1QixvQkFBTXZCLFFBQVF3QixNQUFSLENBQWVwQixXQUFmLENBQU4sRUFBdkI7QUFDQSxZQUFLVixXQUFMLENBQWlCK0IsSUFBakIsQ0FBc0IzQixVQUF0QjtBQUNBLGFBQU9NLFdBQVAsQ0E1QmtCO0FBNkJuQjs7QUFFRDs7O0FBR01zQixNQUFOLEdBQWE7QUFDWCxZQUFNLE9BQUtoQyxXQUFMLENBQWlCaUMsR0FBakIsQ0FBcUIsd0JBQVFDLEtBQUtDLEtBQUwsRUFBUixFQUFyQixDQUFOO0FBQ0EsYUFBTyxPQUFLbkMsV0FBWixDQUZXO0FBR1osR0F0RDRCLEMsa0JBQVZOLFMiLCJmaWxlIjoic2VydmVyLmpzIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IGFzc2VydCBmcm9tICdhc3NlcnQnO1xuaW1wb3J0IFJtcUNvbm5lY3Rpb24gZnJvbSAnLi9jb25uZWN0aW9uJztcblxuLyoqXG4gKiBSYWJiaXRNUSBDb25zdW1lciBDbGFzc1xuICovXG5leHBvcnQgZGVmYXVsdCBjbGFzcyBSbXFTZXJ2ZXIge1xuICBjb25zdHJ1Y3RvcihvcHRpb24gPSB7IGR1cmFibGU6IGZhbHNlIH0pIHtcbiAgICBjb25zdCBjaGFubmVsVHlwZSA9IHR5cGVvZiBvcHRpb24ucXVldWU7XG4gICAgYXNzZXJ0KGNoYW5uZWxUeXBlID09PSAnc3RyaW5nJywgYEV4cGVjdGluZyAnY2hhbm5lbCcgYXMgYSBzdHJpbmcgYnV0IGdvdCAke2NoYW5uZWxUeXBlfS5gKTtcblxuICAgIHRoaXMub3B0aW9uID0gb3B0aW9uO1xuICAgIHRoaXMuY29ubmVjdGlvbnMgPSBbXTtcbiAgfVxuXG4gIGdldCBxdWV1ZSgpIHtcbiAgICByZXR1cm4gdGhpcy5vcHRpb24ucXVldWU7XG4gIH1cblxuICAvKipcbiAgICogQWRkcyBhIG5ldyB3b3JrZXIgb2YgdGhlIHNhbWUgY2hhbm5lbC5cbiAgICogQHBhcmFtIGZuXG4gICAqL1xuICBhc3luYyBhZGRXb3JrZXIoZm4pIHtcbiAgICBjb25zdCBmblR5cGUgPSB0eXBlb2YgZm47XG4gICAgYXNzZXJ0KGZuVHlwZSA9PT0gJ2Z1bmN0aW9uJywgYEV4cGVjdGluZyAnZm4nIHRvIGJlIGEgZnVuY3Rpb24gYnV0IGdvdCAke2ZuVHlwZX0uYCk7XG4gICAgY29uc3QgY29ubmVjdGlvbiA9IGF3YWl0IChuZXcgUm1xQ29ubmVjdGlvbih0aGlzLm9wdGlvbikuaW5pdGlhbGl6ZUNvbm5lY3Rpb24oKSk7XG4gICAgY29uc3QgY2hhbm5lbCA9IGF3YWl0IGNvbm5lY3Rpb24uZ2V0Q2hhbm5lbCgpO1xuXG4gICAgYXdhaXQgY2hhbm5lbC5hc3NlcnRRdWV1ZSh0aGlzLm9wdGlvbi5xdWV1ZSwgeyBkdXJhYmxlOiBmYWxzZSB9KTtcbiAgICBhd2FpdCBjaGFubmVsLnByZWZldGNoKDEpO1xuICAgIGNvbnN0IHsgY29uc3VtZXJUYWcgfSA9IGNoYW5uZWwuY29uc3VtZSh0aGlzLm9wdGlvbi5jaGFubmVsLCBhc3luYyAobXNnKSA9PiB7XG4gICAgICBpZiAobXNnID09PSBudWxsKSB7XG4gICAgICAgIHJldHVybjtcbiAgICAgIH1cblxuICAgICAgbGV0IHJlc3VsdCA9IG51bGw7XG4gICAgICB0cnkge1xuICAgICAgICBjb25zdCB7IHBheWxvYWQgfSA9IEpTT04ucGFyc2UobXNnLmNvbnRlbnQudG9TdHJpbmcoKSk7XG4gICAgICAgIHJlc3VsdCA9IHsgcGF5bG9hZDogYXdhaXQgZm4ocGF5bG9hZCkgfTtcbiAgICAgIH0gY2F0Y2ggKGUpIHtcbiAgICAgICAgcmVzdWx0ID0geyBlcnJvcjogeyBtZXNzYWdlOiBlLm1lc3NhZ2UsIGVycm9yOiBlIH0gfTtcbiAgICAgIH1cblxuICAgICAgY29uc3QgeyBjb3JyZWxhdGlvbklkIH0gPSBtc2cucHJvcGVydGllcztcbiAgICAgIGF3YWl0IGNoYW5uZWwuc2VuZFRvUXVldWUobXNnLnByb3BlcnRpZXMucmVwbHlUbywgbmV3IEJ1ZmZlcihKU09OLnN0cmluZ2lmeShyZXN1bHQpKSwgeyBjb3JyZWxhdGlvbklkIH0pO1xuICAgICAgY2hhbm5lbC5hY2sobXNnKTtcbiAgICB9KTtcblxuICAgIGNvbm5lY3Rpb24ub24oJ2Nsb3NlJywgKCkgPT4gY2hhbm5lbC5jYW5jZWwoY29uc3VtZXJUYWcpKTtcbiAgICB0aGlzLmNvbm5lY3Rpb25zLnB1c2goY29ubmVjdGlvbik7XG4gICAgcmV0dXJuIGNvbnN1bWVyVGFnO1xuICB9XG5cbiAgLyoqXG4gICAqIENsb3NlcyBhbGwgdGhlIGNvbm5lY3Rpb24gdGhhdCBoYXMgYmVlbiBtYWRlLlxuICAgKi9cbiAgYXN5bmMgc3RvcCgpIHtcbiAgICBhd2FpdCB0aGlzLmNvbm5lY3Rpb25zLm1hcChjb25uID0+IGNvbm4uY2xvc2UoKSk7XG4gICAgZGVsZXRlIHRoaXMuY29ubmVjdGlvbnM7XG4gIH1cbn1cbiJdfQ==