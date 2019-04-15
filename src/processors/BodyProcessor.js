import BaseProcessor from '@/processors/BaseProcessor';
import FMFException from '@/helpers/FMFException';

export default class BodyProcessor extends BaseProcessor {
  _type = null;

  constructor(key, matcher, type) {
    super(key, matcher);
    this._type = type;
  }

  async _processBody(request) {
    let current;

    // Try to decode body
    switch (this._type.toLowerCase()) {
      case 'text':
        try {
          current = await request.clone().text();
        } catch (err) {
          /* istanbul ignore next */
          throw new FMFException('Unable to parse body as blob', err);
        }
        break;
      case 'json':
        try {
          current = await request.clone().json();
        } catch (err) {
          /* istanbul ignore next */
          throw new FMFException('Unable to parse body as JSON', err);
        }
        break;
      case 'formdata':
        try {
          current = await request.clone().formData();
        } catch (err) {
          /* istanbul ignore next */
          throw new FMFException('Unable to parse body as FormData', err);
        }
        break;
      case 'arraybuffer':
        try {
          current = await request.clone().arrayBuffer();
        } catch (err) {
          /* istanbul ignore next */
          throw new FMFException('Unable to parse body as Blob', err);
        }
        break;
      case 'blob':
        try {
          current = await request.clone().blob();
        } catch (err) {
          /* istanbul ignore next */
          throw new FMFException('Unable to parse body as Blob', err);
        }
        break;
      /* istanbul ignore next */
      default:
        throw new FMFException('Unknown body decoder callback')
    }

    return current;
  }

  equal(expected) {
    this._evaluate = async request => {
      const current = await this._processBody(request);

      return await this._equal(current, expected, request);
    }

    return this._matcher;
  }
}
