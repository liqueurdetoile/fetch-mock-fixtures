/**
 * Main fixture constructor
 * @version 1.0.0
 * @since 1.0.0
 * @author Liqueur de Toile <contact@liqueurdetoile.com>
 */
export default class Fixture {
  /**
   * Server instance
   * @type {Server}
   */
  server = null;

  /**
   * Response body
   * @type {mixed}
   */
  body = null;

  /**
   * Response delay in ms
   * @type {Number}
   */
  delay = 0;

  /**
   * Response status
   * @type {Number}
   */
  status = null;

  /**
   * Response status text
   * @type {String}
   */
  statusText = null;

  /**
   * Response headers
   * @type {Headers}
   */
  _headers = null;

  /**
   * Response wrapper
   * @type {Boolean|String|Function}
   */
  wrapper = false;

  /**
   * Fixture constructor
   * @version 1.0.0
   * @since   1.0.0
   * @param   {Server}  server Server instance
   */
  constructor(server, init) {
    this.server = server;

    this.delay = init.delay || server.delay;
    this.headers = init.headers || server.headers;
    this.status = init.status || server.status;
    this.statusText = init.statusText || server.statusText;
    this.wrapper = init.wrapper || server.wrapper;
    this.body = init.body || null;

    if (init.initialized instanceof Function) this.initialized = init.initialized;
    if (init.destroyed instanceof Function) this.destroyed = init.destroyed;
  }

  get headers() {
    return this._headers;
  }

  set headers(headers = {}) {
    if (headers instanceof Headers) {
      this._headers = headers;
      return this;
    }

    this._headers = new Headers(headers);
    return this;
  }

  /**
   * Returns the response initialization object based on fixture properties
   * @version 1.0.0
   * @since   1.0.0
   * @return  {Object}  Response init object
   */
  get init() {
    return {
      delay: this.delay,
      headers: this.headers,
      status: this.status,
      statusText: this.statusText,
      wrapper: this.wrapper,
    }
  }
}
