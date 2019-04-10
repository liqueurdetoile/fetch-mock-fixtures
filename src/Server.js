import {FMFRequest, Fixture, Preset} from '.';
import ServerHistory from './helpers/ServerHistory';
import presets from './presets';
// import parse from 'url-parse';
// import pathToRegexp from 'path-to-regexp';
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
  _fixtures = [];
  _onError = 'throw';
  _presets = {};

  history = new ServerHistory();

  constructor() {
    // Load presets
    for (let name in presets) {
      this._presets[name] = new Preset(this, name, presets[name]);
    }
  }

  /**
   * Start the server by stubbing `window.fetch`
   * @version 1.0.0
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
   * Stop the server
   * @version 1.0.0
   * @since   1.0.0
   * @return  {Server}               Server instance
   */
  stop(resetServer = false) {
    if (this.running) window.fetch.restore();

    if (resetServer) this.reset();

    return this;
  }

  /**
   * Reset the server configuration to default and
   * clear stub overrides and server history
   * @version 1.1.0
   * @since   1.0.0
   * @return  {Server}               Server instance
   */
  reset(resetStub = true) {
    if (this.running && resetStub) this.stub.resetHistory();
    this.history.reset();
    this._fixtures = [];
    this.throwOnError(true);

    return this;
  }

  throwOnError(throwOnError) {
    this._onError = throwOnError ? 'throw' : 'fail500';

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

  get calls() {
    return this.stub.callCount;
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

  preset(name, preset = {}) {
    if (this._presets[name]) return this._presets[name].set(preset);

    let newPreset = new Preset(this, name, preset);

    this._presets[name] = newPreset;

    return newPreset;
  }

  get on() {
    const fixture = new Fixture(this)

    this._fixtures.push(fixture);

    fixture._mode = 'on';

    return fixture.on;
  }

  get when() {
    return this.on;
  }

  _getDefaultFixture() {
    // If a default fixture exists, return it
    const index = this._fixtures.findIndex(f => f._matcher === null);

    if (index >= 0) return this._fixtures[index];

    // Create a new default Fixture and register it
    const fixture = new Fixture(this);

    this._fixtures.push(fixture);
    return fixture;
  }

  _processRespond(fixture = {}) {
    if (fixture._mode === 'respond') fixture = this._getDefaultFixture();

    fixture._mode = 'respond';

    return fixture;
  }

  get respond() {
    return this._getDefaultFixture();
  }

  async _findFixture(request) {
    let matches = [];

    if (!this._fixtures.length) throw new Error('No fixtures defined to respond to request');

    for (let fixture of this._fixtures) {
      // Do not register fallback fixture
      if (fixture._matcher === null) continue;
      if (await fixture.match(request)) matches.push(fixture);
    }

    if (!matches.length) {
      const index = this._fixtures.findIndex(f => f._matcher === null);

      if (index >= 0) return this._fixtures[index];

      throw new Error('Unable to find a matching fixture for the current request and no fixture is set as fallback');
    }

    if (matches.length > 1) {
      console.warn(`FMF : Server found ${matches.length} fixtures matching the request "${request.url}". Using the first one.`); // eslint-disable-line
    }

    return matches[0];
  }

  async _processRequest(request, init) {
    try {
      // Build FMFRequest object
      request = new FMFRequest(request, init);

      // Locate matching fixture
      let fixture = await this._findFixture(request);

      // Prepare response
      let response = await fixture.getResponse(request);

      // Store request in history
      this.history.push(request.clone(), response.clone());

      return response;
    } catch (err) {
      if (this._onError === 'throw') throw err;

      return new Response(err.toString(), {
        'content-type': 'text/html',
        status: 500,
        statusText: 'FMF error'
      })
    }
  }

  get request() {
    return this.history.request.last;
  }

  get response() {
    return this.history.response.last;
  }
}

export default Server;
