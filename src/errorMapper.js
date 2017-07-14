import assert from 'assert';

export default class ErrorMapper {
  constructor() {
    this.errorMaps = {};
  }

  addHandler(handler) {
    if (typeof handler === 'object') {
      const keys = Object.keys(handler);
      keys.forEach(key => this.addHandler(handler[key]));
    }

    assert(handler.getCode, 'Expecting handler to have static getCode method.');
    Object.assign(this.errorMaps, { [handler.getCode()]: handler });
  }

  /**
   * Determines whether the name has an error associated.
   * @param name
   * @returns {boolean}
   */
  hasError(name) {
    return !!this.errorMaps[name];
  }

  /**
   * Returns a new instance of error associated to the name.
   * @param name
   * @param args
   */
  error(name, args) {
    return new this.errorMaps[name](args);
  }
}
