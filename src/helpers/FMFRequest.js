import parse from 'url-parse';

export class FMFRequest extends Request {
  constructor(resource, init) {
    super(resource, init);

    const parts = parse(this.url, true);

    for (let key in parts) {
      Object.defineProperty(this, key, {
        value: parts[key]
      })
    }
  }
}

export default FMFRequest;
