export class ResponseConfigurator {
  server = null;

  /**
   * Ordered independent response for fixture. It will be used
   * when ordered responses are not matching current call count.
   * @type {Object}
   */
  _any = {};
  _responseKeys = ['body', 'delay', 'headers', 'status', 'statusText', 'wrapper', 'pattern', 'before', 'after'];

  constructor(server) {
    this.server = server;
  }

  preset(name, preset) {
    return this.server.preset(name, preset);
  }

  get on() {
    return this.server.on;
  }

  get when() {
    return this.server.on;
  }

  get respond() {
    return this.server._processRespond(this);
  }

  get with() {
    return this;
  }

  get and() {
    return this;
  }

  set(response = {}) {
    if (!(response instanceof Object)) throw new Error('Response set must be an object');

    for (let key in response) {
      if (!this._responseKeys.includes(key)) {
        console.warn(`Invalid key "${key}" for response set configuration`); //eslint-disable-line
        continue;
      }

      // Run setters
      this[key](response[key]);
    }

    return this;
  }

  body(body) {
    let response = this._getCurrentResponseSet();

    if (body === false) delete response.body;
    else response.body = body;

    return this;
  }

  delay(delay) {
    let response = this._getCurrentResponseSet();

    if (delay === false) delete response.delay;
    else response.delay = parseInt(delay, 10);

    return this;
  }

  headers(headers) {
    if (headers && !(headers instanceof Object || headers instanceof Headers)) {
      throw new Error('Headers must be an object or an Headers instance');
    }

    if (headers instanceof Object) headers = new Headers(headers);

    let response = this._getCurrentResponseSet();

    if (headers) response.headers = headers;
    else delete response.headers;

    return this;
  }

  status(status) {
    let response = this._getCurrentResponseSet();

    if (status === false) delete response.status;
    else response.status = parseInt(status, 10);

    return this;
  }

  statusText(text) {
    let response = this._getCurrentResponseSet();

    if (text) response.statusText = text;
    else delete response.statusText;

    return this;
  }

  wrapper(wrapper) {
    let response = this._getCurrentResponseSet();

    if (wrapper) response.wrapper = wrapper;
    else delete response.wrapper;

    return this;
  }

  pattern(pattern) {
    let response = this._getCurrentResponseSet();

    if (pattern) response.pattern = pattern;
    else delete response.pattern;

    return this;
  }

  before(cb) {
    if (cb && !(cb instanceof Function)) {
      throw new Error('Before hook must be a function');
    }

    let response = this._getCurrentResponseSet();

    if (cb) response.before = cb;
    else delete response.before;

    return this;
  }

  after(cb) {
    if (cb && !(cb instanceof Function)) {
      throw new Error('Before hook must be a function');
    }

    let response = this._getCurrentResponseSet();

    if (cb) response.after = cb;
    else delete response.after;

    return this;
  }
}

export default ResponseConfigurator
