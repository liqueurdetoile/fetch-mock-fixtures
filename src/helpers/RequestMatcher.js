import BooleanProcessor from '@/processors/BooleanProcessor';
import BodyProcessor from '@/processors/BodyProcessor';
import HeadersProcessor from '@/processors/HeadersProcessor';
import QueryProcessor from '@/processors/QueryProcessor';
import StringProcessor from '@/processors/StringProcessor';

export class RequestMatcher {
  _processors = [];
  _requestKeys = [
    'method', 'url', 'headers', 'destination', 'referrer', 'referrerPolicy', 'mode',
    'credentials', 'redirect', 'integrity', 'cache',
    'protocol', 'slashes', 'auth', 'username', 'password', 'host', 'hostname', 'port',
    'pathname', 'query', 'hash', 'href', 'method', 'header', 'body'
  ];

  constructor(fixture) {
    this.fixture = fixture;
  }

  get on() {
    return this.fixture.on;
  }

  get respond() {
    return this.fixture.respond;
  }

  getProcessor(key) {
    let processor;

    switch (key) {
      case 'headers':
        processor = new HeadersProcessor(key, this);
        break;
      case 'query':
        processor = new QueryProcessor(key, this);
        break;
      case 'slashes':
        processor = new BooleanProcessor(key, this);
        break;
      case 'auth':
      case 'cache':
      case 'credentials':
      case 'destination':
      case 'hash':
      case 'href':
      case 'host':
      case 'hostname':
      case 'integrity':
      case 'method':
      case 'password':
      case 'pathname':
      case 'protocol':
      case 'redirect':
      case 'referrer':
      case 'referrerPolicy':
      case 'url':
      case 'username':
        processor = new StringProcessor(key, this)
        break;
      default:
        throw new Error('Unsupported request parameter to check');
    }

    this._processors.push(processor);

    return processor;
  }

  body(type = 'text', warn = true) {
    const processor = new BodyProcessor('headers', this, type, warn);

    this._processors.push(processor);

    return processor;
  }

  header(name) {
    const processor = new HeadersProcessor('headers', this, name);

    this._processors.push(processor);

    return processor;
  }

  async match(request) {
    for (let processor of this._processors) {
      let passed = await processor.process(request);
      if (!passed) return false;
    }

    return true;
  }

  request(conditions) {
    if (!(conditions instanceof Object)) throw new Error('Request conditions set must be an object');

    for (let key in conditions) {
      if (!this._requestKeys.includes(key)) {
        console.warn(`Invalid key "${key}" for request conditions configuration`); //eslint-disable-line
        continue;
      }

      // Run setters
      this[key].equal(conditions[key]);
    }

    return this;
  }
}

export default RequestMatcher;
