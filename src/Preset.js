import ResponseConfigurator from './helpers/ResponseConfigurator';

export class Preset extends ResponseConfigurator {
  constructor(server, name, preset) {
    super(server);

    if (!name) throw new Error('You must provide a name to the preset');
    this.name = name;

    if (preset) {
      if (!(preset instanceof Object)) throw new Error('Preset options must be provided as an object');
      this.set(preset);
    }
  }

  _getCurrentResponseSet() {
    this._any = this._any || {};
    return this._any;
  }
}

export default Preset;
