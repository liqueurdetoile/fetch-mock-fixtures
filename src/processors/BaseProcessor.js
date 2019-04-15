import _isEqual from 'lodash.isequal';

export default class BaseProcessor {
  _key = null;
  _not = false;
  _evaluate = null;

  constructor(key, matcher) {
    this._key = key;
    this._matcher = matcher;
  }

  get is() {
    return this;
  }

  get not() {
    this._not = !this._not;

    return this;
  }

  async _equal(current, expected, request) {
    if (expected instanceof Function) return await expected(current, this._key, request);
    if (expected instanceof RegExp) return expected.test(current);

    // Try to parse current as JSON to convert boolean and numbers
    try {
      current = JSON.parse(current);

      return _isEqual(current, expected);
    } catch (err) {
      return _isEqual(current, expected);
    }
  }

  equal(expected) {
    this._evaluate = async request => {
      let current = request[this._key];

      return await this._equal(current, expected, request);
    }

    return this._matcher;
  }

  async process(request, server) {
    let passed = await this._evaluate(request, server);

    return this._not ? !passed: passed;
  }
}
