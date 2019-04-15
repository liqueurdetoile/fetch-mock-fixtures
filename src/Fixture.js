import Preset from './Preset';
import ResponseConfigurator from './helpers/ResponseConfigurator';
import RequestMatcher from './helpers/RequestMatcher';
import FMFException from './helpers/FMFException';
import pathToRegexp from 'path-to-regexp';

/**
 * A fixture contains all the needed informations to find
 * out wich request can be matched and wich response
 * must be sent back
 * @version 1.0.0
 * @since 2.0.0
 */
export class Fixture extends ResponseConfigurator {
  /**
   * Stores the number of responses generated by this fixture
   * @type {Number}
   * @since 2.0.0
   */
  calls = 0;

  /**
   * Stores the response which are specific to own call count
   * @type {Array}
   * @since 2.0.0
   */
  ownCalls = [];

  /**
   * Stores the response which are specific to global call count
   * @type {Array}
   * @since 2.0.0
   */
  globalCalls = [];

  /**
   * Flag for response configuration
   * @type {null|Number}
   * @since 2.0.0
   */
  _callnum = null;

  /**
   * Request matcher instance
   * @type {null|RequestMatcher}
   * @since 2.0.0
   */
  _matcher = null;

  /**
   * Flag for call count configuration
   * @type {Boolean}
   * @since 2.0.0
   */
  _ownCall = false;

  /**
   * Allow response key for configuration
   * @type {Array}
   * @since 2.0.0
   */
  _responseKeys = ['body', 'delay', 'headers', 'status', 'statusText', 'wrapper', 'pattern', 'before', 'after', 'preset'];

  /**
   * Initialize the ResponseConfigurator helper
   * @version 1.0.0
   * @since   2.0.0
   * @param   {Server}  [server] Server instance
   */
  constructor(server) {
    super(server);
  }

  /**
   * Set the fixture in request matching mode. The matcher is
   * behing a proxy to allow quick property mapping
   *
   * @version 1.0.0
   * @since   2.0.0
   * @return  {RequestMatcher}  Request matcher
   */
  get on() {
    if (this._mode === 'respond') return this.server.on;

    this._matcher = this._matcher || new RequestMatcher(this);

    return new Proxy(this._matcher, {
      get: (obj, prop) => prop in obj ? obj[prop] : obj.getProcessor(prop)
    });
  }

  /**
   * Alias for `on`
   * @version 1.0.0
   * @since   2.0.0
   * @return  {RequestMatcher}  Request matcher
   */
  get when() {
    return this.on;
  }

  /**
   * Ask server to process the respond. If the fixture is already in response
   * mode, a new fixture will be returned. Otherwise, it will be the same fixture
   * @version 1.0.0
   * @since   2.0.0
   * @return  {Fixture}  Fixture
   */
  get respond() {
    return this.server ? this.server._processRespond(this) : this;
  }

  /**
   * Target the current response set based on call count configuration
   * @version 1.0.0
   * @since   2.0.0
   * @return  {Object}  Response configuration object
   */
  _getCurrentResponseSet() {
    if (this._callnum !== null) {
      if (this._ownCall) {
        this.ownCalls[this._callnum] = this.ownCalls[this._callnum] || {}
        return this.ownCalls[this._callnum];
      }
      this.globalCalls[this._callnum] = this.globalCalls[this._callnum] || {}
      return this.globalCalls[this._callnum];
    }

    this._any = this._any;
    return this._any;
  }

  /**
   * Syntax sugar for human readability
   * @version 1.0.0
   * @since   1.0.0
   * @return  {Fixture}
   */
  get to() {
    return this;
  }

  /**
   * Alias for respond that always return the fallback fixture
   * @version 1.0.0
   * @since   2.0.0
   * @return  {Fixture}  Fallback fixture
   */
  get fallback() {
    return this.server.fallback;
  }

  firstCall(own = false) {
    this._callnum = 1;
    this._ownCall = own;

    return this;
  }

  secondCall(own = false) {
    this._callnum = 2;
    this._ownCall = own;

    return this;
  }

  thirdCall(own = false) {
    this._callnum = 3;
    this._ownCall = own;

    return this;
  }

  call(n, own) {
    this._callnum = parseInt(n, 10);
    this._ownCall = own;

    return this;
  }

  get any() {
    this._callnum = null;
    this._ownCall = false;

    return this;
  }

  preset(name) {
    let response = this._getCurrentResponseSet();

    if (name) response.preset = name;
    else delete response.preset;

    return this;
  }

  async match(request, server) {
    /* istanbul ignore if */
    if (!this._matcher) return true;

    return await this._matcher.match(request, server);
  }

  async sleep(delay) {
    await new Promise(resolve => setTimeout(resolve, delay));
  }

  extractParams(pathname, pattern) {
    const params = {};
    const keys = [];
    const re = pathToRegexp(pattern, keys);
    const parsed = re.exec(pathname);

    for (let i = 0; i < keys.length; i++) {
      let name = keys[i].name;
      let value = parsed[i+1];

      params[name] = value;
    }

    return params;
  }

  wrap(body, wrapper) {
    if (wrapper instanceof Function) return wrapper(body);

    return body || null;
  }

  getPath(request, response) {
    let url = response.pattern || request.pathname;
    let path = url.split('/').filter(p => p && p.indexOf(':') < 0);
    let filename = request.method.toLowerCase();

    return path.concat(filename).join('/');
  }

  _exceptionManagement(err, message) {
    if (err instanceof Error || typeof err === 'string') {
      throw new FMFException(message, err);
    }

    if (err instanceof Response) {
      return err;
    }

    if (err instanceof Preset) {
      let {body, headers, status, statusText} = err._any;

      return new Response(body, {headers, status, statusText});
    }

    /* istanbul ignore else */
    if (err instanceof Object) {
      let {body, headers, status, statusText} = err;

      return new Response(body, {headers, status, statusText});
    }
  }

  async _buildResponse(request, response) {
    // Process before hook and update response if one is returned
    if (response.before instanceof Function) {
      try {
        let responseReplacement = await response.before.call(this, this.server, request, response);

        if (responseReplacement) response = responseReplacement;
      } catch (err) {
        return this._exceptionManagement(err, 'Unable to process before callback');
      }
    }

    // Extract params if a pattern have been set
    let params = response.pattern ? this.extractParams(request.pathname, response.pattern) : {};

    // Process body callback
    try {
      if (response.body instanceof Function) response.body = await response.body.call(this, params, {
        request,
        response,
        server: this.server
      });
    } catch (err) {
      return this._exceptionManagement(err, 'Unable to process body callback');
    }

    // Apply preset
    if (response.preset) {
      let preset = this.server._presets[response.preset];

      /* istanbul ignore if */
      if (!preset) throw new FMFException(`Unable to apply preset. Preset ${response.preset} is not defined`);
      response = Object.assign(response, preset._any);
    }

    // Construct response
    let {body, headers, status, statusText, wrapper} = response;

    const responseObject = new Response(this.wrap(body, wrapper), {headers, status, statusText});

    // Process after hook
    try {
      if (response.after instanceof Function) await response.after.call(this, this.server, responseObject);
    } catch (err) {
      return this._exceptionManagement(err, 'Unable to process after callback');
    }

    // Delay response
    if (response.delay) await this.sleep(response.delay);

    return responseObject;
  }

  getResponse(request) {
    const localCalls = ++this.calls;
    const globalCalls = this.server.calls;

    // Match local calls first
    return this._buildResponse(request,
      this.ownCalls[localCalls] ||
      this.globalCalls[globalCalls] ||
      this._any
    );
  }
}

export default Fixture;
