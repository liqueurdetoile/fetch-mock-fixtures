import AbstractProcessor from './AbstractProcessor';
import _isEqual from 'lodash.isequal';

export default class BodyProcessor extends AbstractProcessor {
  _type = null;
  _warn = true;

  constructor(key, matcher, type, warn = true) {
    super(key, matcher);
    this._type = type;
    this._warn = warn;
  }

  equal(expected) {
    this._test = async request => {
      let requestValue, passed = false;

      // Try to decode body
      try {
        requestValue = await request.clone()[this._type]();
      } catch (err) {
        if (this.warn) {
          console.warn( //eslint-disable-line
            'Unable to decode body.\nThis should be harmless if using different decoder between fixtures in the same run.\n',
            `Failed decoding method: ${this._type}\n`,
            err
          );
        }
      }

      if (expected instanceof Function) passed = await expected(requestValue, this._key, request);
      else if (expected instanceof RegExp) passed = expected.test(requestValue);
      else passed = _isEqual(requestValue, expected);

      return passed;
    }

    return this._matcher;
  }
}
