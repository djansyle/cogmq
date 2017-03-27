"use strict";Object.defineProperty(exports, "__esModule", { value: true });
class ConvertableError {
  constructor(errorMap = {}) {
    this.setErrorMap(errorMap);
  }

  /**
     * Sets a new map of error.
     * @param map
     */
  setErrorMap(map) {
    this.errorMaps = map;
  }

  /**
     * Merges the map to the errorMaps.
     * @param map
     */
  mergeErrorMap(map) {
    Object.assign(this.errorMaps, map);
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
     * Throws an error if
     * @param name
     * @param args
     */
  throwError(name, args) {
    throw new this.errorMaps[name](args);
  }

  /**
     * Returns a new instance of error associated to the name.
     * @param name
     * @param args
     */
  error(name, args) {
    return new this.errorMaps[name](args);
  }}exports.default = ConvertableError;