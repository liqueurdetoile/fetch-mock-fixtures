import {FMFRequest, Fixture, Preset} from '.';
import ServerHistory from './helpers/ServerHistory';
import FMFException from './helpers/FMFException';
import presets from './presets';
import sinon from 'sinon';

/**
 * Build a mock server to respond to any fetch calls. It replaces
 * `window.fetch` with a [Sinon stub](https://sinonjs.org/releases/latest/stubs/). Therefore,
 * all functionnalities provided by stub are available
 *
 * **Note :** All the server data is stored in the current instance. That may have
 * unattended side effects when using the same instance through many test without
 * resetting it each time
 *
 * @since 1.0.0
 * @version 1.0.0
 * @author Liqueur de Toile <contact@liqueurdetoile.com>
 */
export class Server {
  /**
   * Store the fixtures loaded into the server or created on-the-fly
   * @type {Array}
   * @since 2.0.0
   * @see {@link Fixture}
   */
  _fixtures = [];

  /**
   * Store if server should output events to console
   * @type {Boolean}
   */
  _verbose = false;

  /**
   * Store wether FMF shoud throw or send a 500 HTTP response when an error is raised
   * @type {Boolean}
   * @since 2.0.0
   * @see {@link Server#throwOnError}
   * @see {@link Server#warnOnError}
   */
  _throwOnError = false;

  /**
   * Store wether FMF shoud display a warning message in console when an error is raised
   * @type {Boolean}
   * @since 2.0.0
   * @see {@link Server#throwOnError}
   * @see {@link Server#warnOnError}
   */
  _warnOnError = true

  /**
   * Store the loaded presets and those created on-the-fly
   * @type {Object}
   * @since 2.0.0
   */
  _presets = {};

  /**
   * Store the server history
   * @type {ServerHistory}
   * @since 2.0.0
   */
  history = new ServerHistory();

  /**
   * Import the default presets into server
   * @version 2.0.0
   * @since   1.0.0
   * @author Liqueur de Toile <contact@liqueurdetoile.com>
   */
  constructor() {
    // Load presets
    for (let name in presets) {
      this._presets[name] = new Preset(this, name, presets[name]);
    }
  }

  /**
   * Start the server by stubbing `window.fetch`
   * @version 2.0.0
   * @since   1.0.0
   * @return  {Server}               Server instance
   */
  start() {
    /* istanbul ignore else */
    if (!this.running) {
      sinon.stub(window, 'fetch');
      this.stub.callsFake(this._processRequest.bind(this));
    }

    return this;
  }

  /**
   * Stop the server and, optionnally reset it
   * @version 2.0.0
   * @since   1.0.0
   * @param   {Boolean} [resetServer=false] If `true`, `stop` will also reset server (see {@link Server#reset})
   * @return  {Server}               Server instance
   */
  stop(resetServer = false) {
    if (this.running) window.fetch.restore();

    if (resetServer) this.reset();

    return this;
  }

  /**
   * Reset the server configuration to default, clear server history and stub history
   * @version 2.0.0
   * @since   1.0.0
   * @param   {Boolean} [resetStub=true] If `true`, the stub history will also be resetted
   * @return  {Server}               Server instance
   */
  reset(resetStub = true) {
    if (this.running && resetStub) this.stub.resetHistory();
    this.history.reset();
    this._fixtures = [];

    return this;
  }

  /**
   * Set the verbose behavior of the server
   * @version 1.0.0
   * @since   2.1.0
   * @param   {Boolean}  verbose If `true` turn the verbose mode on
   * @return  {Server}               Server instance
   */
  verbose(verbose) {
    this._verbose = !!verbose;
    this.history._verbose = !!verbose;

    return this;
  }

  /**
   * Tells the server to display a warning in console when an error is raised or when
   * something seems to went wrong in configuration.
   *
   * Default settings is true
   *
   * @version 1.0.0
   * @since   2.0.0
   * @param   {Boolean}  warnOnError `true` will display warnings
   * @return  {Server}               Server instance
   */
  warnOnError(warnOnError) {
    this._warnOnError = !!warnOnError;

    return this;
  }

  /**
   * Set the behavior of the server when an Error is thrown. If set to `true`, the server will
   * also throw the error at runtime. If set to false, it will respond with a 500 HTTP error
   *
   * At default, the server is set to throw on error that will usually be
   * the most suitable behavior when running tests to discard FMF failures.
   *
   * **note** Only errors thrown during requests processing are affected by this parameter.
   * Errors that occured on settings processing will always be raised
   *
   * @version 1.0.0
   * @since   2.0.0
   * @param   {Boolean}  throwOnError If `true` server will throw
   * @return  {Server}               Server instance
   * @see {@link Server#_onError}
   */
  throwOnError(throwOnError) {
    this._throwOnError = !!throwOnError;

    return this;
  }

  /**
   * Displays a warning message in console. It can be overridden
   * to swap to another notification system
   * @version 1.0.0
   * @since   2.0.0
   * @param   {String|Error}  error Error description
   */
  warn(error) {
    console.warn(error.toString()); // eslint-disable-line
  }

  /**
   * Check if server is currently running by trying to access a stub property
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

    throw new FMFException('Server is not started');
  }

  /**
   * Returns the selected preset or a new one based on name resolution.
   *
   * It allow a quick preset creation or edition that can be configured at once
   * through the object provided within this call or with the classic
   * ResponseConfigurator
   *
   * @version 1.0.0
   * @since   2.0.0
   * @param   {String}  name        Preset name
   * @param   {Object}  [preset={}] Preset content
   * @return {Preset}
   * @see {@link ResponseConfigurator}
   */
  preset(name, preset = {}) {
    if (this._presets[name]) return this._presets[name].set(preset);

    let newPreset = new Preset(this, name, preset);

    this._presets[name] = newPreset;

    return newPreset;
  }

  /**
   * Import a fixture into the server pool. Fixture can be provided as a
   * fixture instance or as a configuration object
   * @version 1.0.0
   * @since   2.0.0
   * @param   {Fixture|Object|Array}  fixtures Fixture(s) to import
   * @return  {Server}               Server instance
   * @throws {FMFException} If fixture cannot be parsed
   */
  import(fixtures) {
    if (!(fixtures instanceof Array)) fixtures = [fixtures];

    for (let fixture of fixtures) {
      if (fixture instanceof Fixture) {
        fixture.server = this;
        this._fixtures.push(fixture);
      }
      else if (fixture instanceof Object) {
        let f = new Fixture(this);
        let conditions = fixture.on || fixture.when;

        if (!fixture.respond) throw new FMFException('Fixture provided as object must have a respond property');
        /* istanbul ignore else */
        if (conditions) f.on.equal(conditions);
        f.respond.set(fixture.respond);

        this._fixtures.push(f)
      }
      else throw new FMFException('Invalid fixture provided');
    }

    return this;
  }

  /**
   * This getter is used when configuring a fixture in-the-fly. It will return
   * and register a new Fixture and set it to `matching` mode
   * @version 1.0.0
   * @since   2.0.0
   * @return  {Fixture}  New Fixture
   */
  get on() {
    const fixture = new Fixture(this)

    this._fixtures.push(fixture);

    fixture._mode = 'on';

    return fixture.on;
  }

  /**
   * Alias for {@link Server#on}
   * @version 1.0.0
   * @since   2.0.0
   * @return  {Fixture}  New fixture
   */
  get when() {
    return this.on;
  }

  /**
   * Returns the existing registered on the server or create and register a new fallback fixture
   * to configure
   * @version 1.0.0
   * @since   2.0.0
   * @return  {Fixture}  Fallback fixture
   * @see {@link Server#_getDefaultFixture}
   */
  get fallback() {
    return this._getDefaultFixture();
  }

  /**
   * Returns the existing registered on the server or create a new fallback fixture
   * to configure
   * @version 1.0.0
   * @since   2.0.0
   * @return  {Fixture}  Fallback fixture
   */
  _getDefaultFixture() {
    // If a default fixture exists, return it
    const index = this._fixtures.findIndex(f => f._matcher === null);

    if (index >= 0) return this._fixtures[index];

    // Create a new default Fixture and register it
    const fixture = new Fixture(this);

    this._fixtures.push(fixture);
    return fixture;
  }

  /**
   * Process the respond call when called from a fixture to allow chainable
   * fixtures on-the-fly configuration
   * @version 1.0.0
   * @since   2.0.0
   * @param   {Object}  [fixture={}] Calling fixture or void object if not called from a fixture
   * @return  {Fixture}              Return either the default fixture or set the current to `respond` mode
   */
  _processRespond(fixture = {}) {
    if (fixture._mode === 'respond') fixture = this._getDefaultFixture();

    fixture._mode = 'respond';

    return fixture;
  }

  /**
   * Getter used when configuring fixture on-the-fly
   * @version 1.0.0
   * @since   2.0.0
   * @return  {Fixture}  Return either the default fixture or set the current to `respond` mode
   * @see {@link Server#_processRespond}
   */
  get respond() {
    return this._getDefaultFixture();
  }

  /**
   * Seeks for matching fixtures when processing a request
   *
   * An error will be raised if no fixtures have been set or if no matching fixtures have been
   * found.
   *
   * FMF will also send a warning to the console
   *
   * @version 1.0.0
   * @since   2.0.0
   * @param   {FMFRequest}  request Request
   * @return  {Promise}         Resolved in fixture instance
   * @throws  {FMFException}   If no fixtures are defined or no matching fixtures found
   */
  async _findFixture(request) {
    let matches = [];
    let fallback = null;

    if (!this._fixtures.length) throw new FMFException('No fixtures defined');

    for (let fixture of this._fixtures) {
      // Do not register fallback fixture
      if (fixture._matcher === null) {
        fallback = fixture;
        continue;
      }
      if (await fixture.match(request)) matches.push(fixture);
    }

    if (!matches.length) {
      if (!fallback) throw new FMFException('Unable to find a matching fixture for the current request and no fixture is set as fallback');
      matches[0] = fallback;
    }

    if (matches.length > 1) {
      this.warn(`FMF : Server found ${matches.length} fixtures matching the request "${request.url}". Using the first one.`); // eslint-disable-line
    }

    return matches[0];
  }

  /**
   * Process the incoming request and update history
   * @version 1.0.0
   * @since   2.0.0
   * @param   {String|Request}  request Incoming request
   * @param   {Object}  [init]  request options
   * @return  {Promise}         Response
   * @throws  {FMFException}  If request processing have failed
   */
  async _processRequest(request, init) {
    try {
      // Build FMFRequest object
      request = new FMFRequest(request, init);

      // Log incoming request
      this.history.log(`Request : ${request.method} ${request.url}`)

      // Locate matching fixture
      let fixture = await this._findFixture(request.clone());

      // Prepare response
      let response = await fixture.getResponse(request.clone());

      // Store request in history
      this.history.push(request.clone(), response.clone());

      this.history.log(`Response sent (${response.status} ${response.statusText})`);

      return response;
    } catch (err) {
      this.history.log(err.toString());

      if (this._warnOnError) this.warn(err);
      if (this._throwOnError) /* istanbul ignore next */ throw (err instanceof FMFException ? err : new FMFException('Request process failure', err));

      return new Response(err.stack, {
        'content-type': 'text/html',
        status: 500,
        statusText: err.toString()
      })
    }
  }

  /**
   * Returs the number of calls made to server since start or last reset
   * @version 1.0.0
   * @since   2.0.0
   * @return  {Number}  Number of requests received
   */
  get calls() {
    return this.stub.callCount;
  }

  /**
   * Returns the last request received by the server
   * @version 1.0.0
   * @since   2.0.0
   * @return  {FMFRequest}
   * @see {@link ServerHistory}
   */
  get request() {
    return this.history.last.request;
  }

  /**
   * Returns the last response received by the server
   * @version 1.0.0
   * @since   2.0.0
   * @return  {FMFRequest}
   * @see {@link ServerHistory}
   */

  get response() {
    return this.history.last.response;
  }
}

export default Server;
