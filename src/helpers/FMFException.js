export default class FMFException extends Error {
  constructor(message, previous = null) {
    super(message);

    this.previous = previous;

    /* istanbul ignore else */
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, FMFException);
    }
  }

  toString() {
    return `FMF error: ${this.message}`;
  }
}
