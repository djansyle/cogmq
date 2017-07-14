export default class CogError extends Error {
  constructor(code, description, meta) {
    super();
    this.code = code;
    this.description = description;
    this.meta = meta;
  }

  toJSON() {
    return { code: this.code, description: this.description, meta: this.meta };
  }
}
