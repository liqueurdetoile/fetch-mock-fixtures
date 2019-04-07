import AbstractProcessor from './AbstractProcessor';
import _isEqual from 'lodash.isequal';

export default class HeadersProcessor extends AbstractProcessor {
  _name = null;

  constructor(key, matcher, name) {
    super(key, matcher);
    this._name = name;
  }

  equal(expected) {
    this._test = async request => {
      const headers = request.headers;

      if (!(headers instanceof Headers)) throw new Error('Unable to extract headers from request');

      const requestValue = this._name ? headers.get(this._name) : headers;
      let passed = false;

      if (expected instanceof Function) passed = await expected(requestValue, this._key, request);
      else if (expected instanceof RegExp) passed = expected.test(requestValue);
      else passed = _isEqual(requestValue, expected);

      return passed;
    }

    return this._matcher;
  }
}
