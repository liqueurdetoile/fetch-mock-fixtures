export default class ServerHistory {
  _history = [];
  _target = null;

  push(request, response) {
    this._history.push({
      request,
      response
    })
  }

  get request() {
    this._target = 'request';
    return this;
  }

  get response() {
    this._target = 'response';
    return this;
  }

  get first() {
    return this.atCall(1);
  }

  get second() {
    return this.atCall(1);
  }

  get third() {
    return this.atCall(1);
  }

  get last() {
    return this.atCall(this._history.length);
  }

  atCall(n) {
    if (!this._target) throw new Error('You must select request or response target before selecting call number')

    return this._history[n-1][this._target];
  }

  reset() {
    this._history = [];
  }
}
