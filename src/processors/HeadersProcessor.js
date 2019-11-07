import BaseProcessor from './BaseProcessor';
import FMFException from '@/helpers/FMFException';

export default class HeadersProcessor extends BaseProcessor {
  _name = null;

  constructor(key, matcher, name) {
    super(key, matcher);
    this._name = name;
  }

  equal(expected) {
    this._evaluate = async request => {
      const headers = request.headers;

      /* istanbul ignore if */
      if (!(headers instanceof Headers)) throw new FMFException('Unable to extract headers from request');

      return await this._equal(this._name ? headers.get(this._name) : headers, expected);
    }

    return this.matcher;
  }
}
