import parse from 'url-parse';

export class FMFRequest extends Request {
  constructor(resource, init) {
    super(resource, init);

    const parts = parse(this.url, true);

    for (let key in parts) {
      Object.defineProperty(this, key, {
        enumerable: true,
        value: parts[key]
      })
    }
  }

  clone() {
    return new FMFRequest(super.clone());
  }
}

export default FMFRequest;
