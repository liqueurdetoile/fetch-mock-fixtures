import Fixture from './Fixture';
import parse from 'url-parse';
import pathToRegexp from 'path-to-regexp';
import sinon from 'sinon';

/**
 * Base class to build a mock server to respond to fetch calls. It stubs
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
   * Reset the server configuration to default
   * @version 1.0.0
   * @since   1.0.0
   * @return  {Server}               Server instance
   */
  reset() {
    this.configure();

    return this;
  }

  /**
   * Start the server by stubbing `window.fetch`
   * @version 1.0.0
   * @since   1.0.0
   * @return  {Server}               Server instance
   */
  start() {
    sinon.stub(window, 'fetch');

    return this;
  }

  /**
   * Stop the server by restoring `window.fetch`
   * @version 1.0.0
   * @since   1.0.0
   * @return  {Server}               Server instance
   */
  stop() {
    window.fetch.restore();

    return this;
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

  get url() {
    let url = parse(this.request.url);

    return url.pathname;
  }

  get query() {
    let url = parse(this.request.url, true);

    return url.query;
  }

  get request() {
    if (window.fetch.firstCall.args[0] instanceof Request) return window.fetch.firstCall.args[0].clone();

    return new Request(window.fetch.firstCall.args[0], window.fetch.lastCall.args[1]);
  }

  get fixture() {
    let url = this.pattern || this.url;
    let path = url.split('/').filter(p => p && p.indexOf(':') < 0);
    let filename = this.request.method.toLowerCase();

    return path.concat(filename).join('/');
  }

  wrap(data) {
    if (!data) return null;

    if (this.wrapper) {
      if (this.wrapper instanceof Function) return this.wrapper(data);

      if (typeof data === 'string') {
        return this.wrapper.replace('%data%', data);
      }

      let body = String(this.wrapper);
      for (let key in data) {
        body = body.replace('%' + key + '%', data[key]);
      }

      return body;
    }

    return data;
  }

  respondWith(data, init = {}) {
    if (data instanceof Response) {
      window.fetch.callsFake(async () => {
        /* istanbul ignore else */
        if (this.delay) await this.sleep(this.delay);
        return data;
      });
      return this;
    }

    init = Object.assign({
      headers: this.headers,
      status: this.status,
      statusText: this.statusText
    }, init);

    window.fetch.callsFake(async () => {
      /* istanbul ignore else */
      if (this.delay) await this.sleep(this.delay);
      return new Response(this.wrap(data), init)
    });

    return this;
  }

  respondWithStatus(status, data) {
    return this.respondWith(data, {
      status
    });
  }

  respondWithJSON(data, options = {}) {
    options.headers = options.headers || new Headers();
    options.headers.set('content-type', 'application/json');

    return this.respondWith(JSON.stringify(data), options);
  }

  respondWithFixture() {
    window.fetch.callsFake(this._loadFixture.bind(this));

    return this;
  }

  async sleep(delay) {
    await new Promise(resolve => setTimeout(resolve, delay));
  }

  _getFixtureParams() {
    throw new Error("Fixture finder have not been implemented. See readme for more informations.");
  }

  async _loadFixture(fixture) {
    let response;

    /* istanbul ignore else */
    if (typeof fixture === 'string') {
      try {
        const init = this._getFixtureParams();

        fixture = new Fixture(this, init);
      } catch (err) {
        return new Response(null, {
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
      const parts = re.exec(this.url);

      for (let i = 0; i < keys.length; i++) {
        params[keys[i].name] = parts[i + 1];
      }
    }

    /* istanbul ignore else */
    if (fixture.initialized instanceof Function) await fixture.initialized(params);

    /* istanbul ignore else */
    if (this.delay) await this.sleep(this.delay);

    response = fixture.response;

    /* istanbul ignore else */
    if (fixture.destroyed instanceof Function) await fixture.destroyed();

    return response;
  }
}

export default Server;
