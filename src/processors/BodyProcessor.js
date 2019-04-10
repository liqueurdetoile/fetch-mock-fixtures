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
      switch (this._type.toLowerCase()) {
        case 'text':
          try {
            requestValue = await request.clone().text();
          } catch (err) {
            if(this._warn) console.warn('Unable to parse body as blob'); // eslint-disable-line
            return false;
          }
          break;
        case 'json':
          try {
            requestValue = await request.clone().json();
          } catch (err) {
            if(this._warn) console.warn('Unable to parse body as JSON'); // eslint-disable-line
            return false;
          }
          break;
        case 'formdata':
          try {
            requestValue = await request.clone().formData();
          } catch (err) {
            if(this._warn) console.warn('Unable to parse body as FormData'); // eslint-disable-line
            return false;
          }
          break;
        case 'blob':
          try {
            requestValue = await request.clone().blob();
          } catch (err) {
            if(this._warn) console.warn('Unable to parse body as Blob'); // eslint-disable-line
            return false;
          }
          break;
        default:
          throw new Error('Unknown body decoder callback')
      }

      if (expected instanceof Function) passed = await expected(requestValue, this._key, request);
      else if (expected instanceof RegExp) passed = expected.test(requestValue);
      else passed = _isEqual(requestValue, expected);

      return passed;
    }

    return this._matcher;
  }
}
