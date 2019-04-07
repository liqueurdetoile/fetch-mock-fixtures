import _isEqual from 'lodash.isequal';

export default class AbstractProcessor {
  _key = null;
  _not = false;
  _test = null;

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

  equal(expected) {
    this._test = async request => {
      let requestValue = request[this._key];
      let passed;

      if (expected instanceof Function) passed = await expected(requestValue, this._key, request);
      else if (expected instanceof RegExp) passed = expected.test(requestValue);
      else passed = _isEqual(requestValue, expected);

      return passed;
    }

    return this._matcher;
  }

  async process(request) {
    let passed = await this._test(request);

    return this._not ? !passed: passed;
  }
}
