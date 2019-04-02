import Fixture from './Fixture';
import parse from 'url-parse';
import pathToRegexp from 'path-to-regexp';
import sinon from 'sinon';

/**
 * Build a mock server to respond to fetch calls. It stubs
 * window.fetch
 *
 * @since 1.0.0
 * @version 1.0.0
 * @author Liqueur de Toile <contact@liqueurdetoile.com>
 */
export class Server {
  /**
   * Server response delay in ms
   * @type {Number}
   * @since 1.0.0
   */
  delay = 0;

  /**
   * Server fixture file location pattern
   * @type {Boolean}
   * @since 1.0.0
   */
  pattern = false;

  /**
   * Server response headers
   * @type {Headers}
   * @since 1.0.0
   */
  headers = new Headers({'content-type': 'text/html'});

  /**
   * Server response status
   * @type {Number}
   * @since 1.0.0
   */
  status = 200;

  /**
   * Server response status text
   * @type {String}
   * @since 1.0.0
   */
  statusText = 'OK';

  /**
   * Server response data wrapper
   * @type {Boolean|String|Function}
   * @since 1.0.0
   */
  wrapper = false;

  /**
   * Stores a call flag to let initialize diifferent successive response
   * @type {null|Number}
   */
  _call = null;

  /**
   * Stores the current stub when pausing server
   * @type {Function}
   */
  _stub = null;

  /**
   * Constructor. Configuration options can be passed.
   * @version 1.0.0
   * @since   1.0.0
   * @param   {Object}  options Options
   */
  constructor(options) {
    if (options) this.configure(options);
  }

  /**
   * Configuration setter
   * @version 1.0.0
   * @since   1.0.0
   * @param   {Object}  [options={}] Options
   * @params  {Number} [options.delay]  Response delay in ms
   * @return  {Server}               Server instance
   */
  configure(options = {}) {
    this
      .setDelay(options.delay)
      .setHeaders(options.headers)
      .setStatus(options.status)
      .setStatusText(options.statusText)
      .setWrapper(options.wrapper)
      .setFixturePattern(options.pattern);

    return this;
  }

  /**
   * Start the server by stubbing `window.fetch`
   * @version 1.0.0
   * @since   1.0.0
   * @return  {Server}               Server instance
   */
  start() {
    /* istanbul ignore else */
    if (!this.running) sinon.stub(window, 'fetch');

    return this;
  }

  /**
   * Stop the server
   * @version 1.0.0
   * @since   1.0.0
   * @return  {Server}               Server instance
   */
  stop() {
    if (this.running) window.fetch.restore();

    return this;
  }

  /**
   * Reset the server configuration to default and
   * clear stub overrides and server history
   * @version 1.1.0
   * @since   1.0.0
   * @return  {Server}               Server instance
   */
  reset(stub = false) {
    if (this.running && stub) {
      window.fetch.reset();
    }
    this.configure();

    return this;
  }

  /**
   * Check if server is running by trying to access a stub property
   * @version 1.0.0
   * @since   1.1.0
   * @return  {Boolean}
   */
  get running() {
    return window.fetch.reset instanceof Function;
  }

  /**
   * Exposes the underlying stub or throws error if server is not started
   * @version 1.0.0
   * @since   1.1.0
   * @return  {Object}  Sinon stub
   */
  get stub() {
    if (this.running) return window.fetch;

    throw new Error('Server is not started');
  }

  /**
   * Returns a parsed request url with url-parse. Prior to 1.0.0, returns only pathname
   * @version [1.1.0]
   * @since   [1.0.0]
   * @return  {Object}  Parsed url
   * @property {String} protocol The protocol scheme of the URL (e.g. http:)
   * @property {String} slashes A boolean which indicates whether the protocol is followed by two forward slashes (//)
   * @property {String} auth Authentication information portion (e.g. username:password)
   * @property {String} username Username of basic authentication
   * @property {String} password Password of basic authentication
   * @property {String} host Host name with port number
   * @property {String} hostname Host name without port number
   * @property {String} port Optional port number
   * @property {String} pathname URL path
   * @property {String} query Parsed object containing query string, unless parsing is set to false
   * @property {String} hash The "fragment" portion of the URL including the pound-sign (#)
   * @property {String} href The full URL
   * @property {String} origin The origin of the URL
   *
   * @see https://www.npmjs.com/package/url-parse
   */
  requestToUrl(request) {
    return parse(request.url, true);
  }

  get request() {
    return this._argsToRequest(this.stub.lastCall.args);
  }

  get url() {
    return this.requestToUrl(this.request);
  }

  get query() {
    return this.url.query;
  }

  _argsToRequest(args) {
    if (args[0] instanceof Request) return args[0].clone();

    return new Request(args[0], args[1]);
  }

  get callCount() {
    return this.stub.callCount;
  }

  getRequest(n) {
    return this._argsToRequest(this.stub.getCall(n).args);
  }

  getAllRequests() {
    let requests = [];

    for (let i = 0; i < this.callCount; i++) {
      requests.push(this.getRequest(i));
    }

    return requests;
  }

  /**
   * Set the response delay server wide
   * @version 1.0.0
   * @since   1.0.0
   * @param   {Number}  [delay=0]    Response delay in ms
   * @return  {Server}               Server instance
   */
  setDelay(delay = 0) {
    this.delay = delay;

    return this;
  }

  setStatus(status = 200) {
    this.status = status;

    return this;
  }

  setStatusText(text = 'OK') {
    this.statusText = text;

    return this;
  }

  setHeaders(headers = {'content-type':'text/html'}) {
    if (headers instanceof Headers) {
      this.headers = headers;
      return this;
    }

    this.headers = new Headers(headers);
    return this;
  }

  setWrapper(wrapper = false) {
    this.wrapper = wrapper;

    return this;
  }

  setFixturePattern(pattern) {
    this.pattern = pattern;

    return this;
  }

  get fixture() {
    let url = this.pattern || this.url.pathname;
    let path = url.split('/').filter(p => p && p.indexOf(':') < 0);
    let filename = this.request.method.toLowerCase();

    return path.concat(filename).join('/');
  }

  wrap(data, wrapper) {
    if (wrapper) {
      if (wrapper instanceof Function) return wrapper(data);

      if (typeof data === 'string') {
        return wrapper.replace('%data%', data);
      }

      let body = String(wrapper);
      for (let key in data) {
        body = body.replace('%' + key + '%', data[key]);
      }

      return body;
    }

    return data || null;
  }

  onFirstCall() {
    return this.onCall(0);
  }

  onSecondCall() {
    return this.onCall(1);
  }

  onThirdCall() {
    return this.onCall(2);
  }

  /**
   * Set the next configuration to be bind to the nth call to fetch
   *
   * @version 1.0.0
   * @since   1.1.0
   * @param   {Number}  n Call count
   * @return  {Server}    Server instance
   */
  onCall(n) {
    this._call = n;
    return this;
  }

  /**
   * Configure the server response
   * @version 1.1.0
   * @since   1.0.0
   * @param   {null|Number|String|Function}  body  Response body
   * @param   {Object}  [init={}]    Initialization object
   * @return  {Server}               Server instance
   */
  respondWith(body, init = {}) {
    let stub = this._call !== null ? this.stub.onCall(this._call) : this.stub;

    // Freeze response init object
    if (this._call !== null) {
      init = Object.assign({
        delay: this.delay,
        headers: this.headers,
        status: this.status,
        statusText: this.statusText,
        wrapper: this.wrapper,
      }, init);
    }

    this._call = null;

    stub.callsFake(() => this._getResponse(body, init));

    return this;
  }

  respondWithStatus(status, body) {
    return this.respondWith(body, {
      status
    });
  }

  respondWithJSON(body, init = {}) {
    init.headers = init.headers || new Headers();
    init.headers.set('content-type', 'application/json');

    return this.respondWith(JSON.stringify(body), init);
  }

  respondWithFixture() {
    let stub = this._call !== null ? this.stub.onCall(this._call) : this.stub;
    this._call = null;

    stub.callsFake(this._loadFixture.bind(this));

    return this;
  }

  async sleep(delay) {
    await new Promise(resolve => setTimeout(resolve, delay));
  }

  /**
   * Loader for fixture params. You can use here the server.fixture dynamic property that
   * computes a path from the current call
   *
   * @version 1.0.0
   * @since   1.1.0
   * @return  {Object}  Fixture params
   */
  getFixtureParams() {
    try {
      let params = this._getFixtureParams();
      console.warn('_getFixtureParams have been deprecated and will be removed in next versions. Please use getFixtureParams instead.'); // eslint-disable-line

      return params;
    } catch (err) {
      throw new Response(null, {
        status: 500,
        statusText: "Fixture loader have not been implemented. See readme for more informations."
      });
    }
  }

  async _loadFixture(fixture) {
    let response;

    if (typeof fixture === 'undefined') throw new Error('You must either provide a path or a fixture initialization object to fetch call');

    /* istanbul ignore else */
    if (typeof fixture === 'string') {
      try {
        const init = this.getFixtureParams();

        fixture = new Fixture(this, init);
      } catch (err) {
        return err instanceof Response ?
          err :
          new Response(null, {
            status: 404,
            statusText: err.toString()
          });
      }
    } else {
      fixture = new Fixture(this, fixture);
    }

    let params = {};

    /* istanbul ignore else */
    if (this.pattern) {
      const keys = [];
      const re = pathToRegexp(this.pattern, keys);
      const parts = re.exec(this.url.pathname);

      for (let i = 0; i < keys.length; i++) {
        params[keys[i].name] = parts[i + 1];
      }
    }

    /* istanbul ignore else */
    if (fixture.initialized instanceof Function) await fixture.initialized(params);

    /* istanbul ignore else */
    if (this.delay) await this.sleep(this.delay);

    response = await this._getResponse(fixture.body, fixture.init);

    /* istanbul ignore else */
    if (fixture.destroyed instanceof Function) await fixture.destroyed();

    return response;
  }

  async _getResponse(body, init = {}) {
    let response;

    if (body instanceof Response) {
      init = Object.assign({delay: this.delay}, init);
      response = body;
    }
    else {
      init = Object.assign({
        delay: this.delay,
        headers: this.headers,
        status: this.status,
        statusText: this.statusText,
        wrapper: this.wrapper
      }, init);

      if (body instanceof Function) body = body(this);
      response = new Response(this.wrap(body, init.wrapper), init)
    }

    /* istanbul ignore else */
    if (init.delay) await this.sleep(init.delay);
    return response.clone();
  }
}

export default Server;
