export default class ServerHistory {
  logs = [];
  _history = [];
  _call = null;
  _target = null;
  _verbose = false;

  push(request, response) {
    this._history.push({
      request,
      response
    })
  }

  log(message) {
    this.logs.push(message);

    if (this._verbose) console.log(message); // eslint-disable-line
  }

  get request() {
    if (this._call) {
      const entry = this._history[this._call - 1].request;

      this._call = null;
      return entry;
    }

    this._target = 'request';
    return this;
  }

  get response() {
    if (this._call) {
      const entry = this._history[this._call - 1].response;

      this._call = null;
      return entry;
    }

    this._target = 'response';
    return this;
  }

  get first() {
    return this.atCall(1);
  }

  get second() {
    return this.atCall(2);
  }

  get third() {
    return this.atCall(3);
  }

  get last() {
    return this.atCall(this._history.length);
  }

  atCall(n) {
    if (this._target) {
      const entry = this._history[n-1][this._target];

      this._target = null;
      return entry;
    }

    this._call = n;
    return this;
  }

  all() {
    if (this._target) {
      const entries = this._history.map(entry => entry[this._target]);
      this._target = null;
      return entries;
    }
    return this._history;
  }

  reset() {
    this._history = [];
    this._log = [];
    this._call = null;
    this._target = null;
  }
}
