import ResponseConfigurator from './helpers/ResponseConfigurator';
import presets from './presets';

/**
 * Presets are a quick way to add common response configuration and
 * avoid duplicating it through all fixtures when configuring
 * server response.
 *
 * Configuration itself is, like the fixtures, based on ResponseConfigurator
 * methods.
 */
export class Preset extends ResponseConfigurator {
  /**
   * Create a new preset instance that can be configured
   * in the same manner than a regular fixture
   *
   * @version 1.0.0
   * @since   2.0.0
   * @param   {Server}  server Server instance
   * @param   {String}  name   Preset name
   * @param   {Object}  [preset] Preset configuration object
   */
  constructor(server, name, preset = {}) {
    super(server);

    if (!name) throw new Error('You must provide a name to the preset');
    this.name = name;

    if (preset) {
      if (!(preset instanceof Object)) throw new Error('Preset options must be provided as an object');
      this.set(preset);
    }
  }

  /**
   * Presets can only handle a default response
   * @version 1.0.0
   * @since   2.0.0
   * @return  {Object}  Current response configuration
   */
  _getCurrentResponseSet() {
    return this._any;
  }

  /**
   * Register/update the preset in the global pool. This made the preset available
   * into all server's instances created *from* the registration
   * @version 1.0.0
   * @since   2.2.0
   * @return  {Preset}  Self for chaining
   */
  register() {
    presets[this.name] = Object.assign({}, this._any);

    return this;
  }

  /**
   * Unregister the preset from the global pool.
   *
   * @version 1.0.0
   * @since   2.2.0
   * @return  {Preset}  Self for chaining
   */
  unregister() {
    delete presets[this.name];

    return this;
  }

  /**
   * Remove the preset from the server's instance pool
   *
   * If the preset is also globally registered, it won't be removed from the
   * global pool
   *
   * @version 1.0.0
   * @since   2.2.0
   * @return  {Preset}  self for chaining
   */
  remove() {
    delete this.server._presets[this.name];

    return this;
  }
}

export default Preset;
