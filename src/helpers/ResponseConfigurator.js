import FMFException from '@/helpers/FMFException';

/**
 * The response configurator class is common to fixtures and presets and offers a set
 * of tools to configure response content and behavior.
 *
 * This class should be seen as an abstract class as it uses `_getCurrentResponseSet` of its
 * child to locate the response to configure
 *
 * ** Note : ** The response configurator does not contain logic to follow
 * calls count.
 *
 * @version 1.0.0
 * @since 2.0.0
 */
export class ResponseConfigurator {
  /**
   * Stores the server instance
   * @type {Server|null}
   * @since 2.0.0
   */
  server = null;

  /**
   * Default response for fixture or preset. For fixture, it will be used
   * when ordered responses are not matching defined call counts.
   * @type {Object}
   * @since 2.0.0
   */
  _any = {};

  /**
   * Allowed response keys
   * @type {Array}
   * @since 2.0.0
   */
  _responseKeys = ['body', 'delay', 'headers', 'status', 'statusText', 'wrapper', 'pattern', 'before', 'after'];

  /**
   * Response configurator constructor
   * @version 1.0.0
   * @since   2.0.0
   * @param   {Server}  [server=null] Server instance
   */
  constructor(server = null) {
    this.server = server;
  }

  /**
   * @abstract
   */
  _getCurrentResponseSet() {}

  /**
   * Sugar for chaining
   * @version 1.0.0
   * @since   2.0.0
   * @return  {ResponseConfigurator}  this
   */
  get with() {
    return this;
  }

  /**
   * Sugar for chaining
   * @version 1.0.0
   * @since   2.0.0
   * @return  {ResponseConfigurator}  this
   */
  get and() {
    return this;
  }

  /**
   * Set the response parameters based on the object provided
   * @version 1.0.0
   * @since   2.0.0
   * @param   {Object}  [params={}] Parameters
   * @see {@link ResponseConfigurator#_responseKeys} for available keys
   * @throw {FMFException} If a key is not valid
   */
  set(params = {}) {
    if (!(params instanceof Object)) throw new Error('Response set must be an object');

    for (let key in params) {
      if (!this._responseKeys.includes(key)) {
        throw new FMFException(`Invalid key "${key}" for response set configuration`);
      }

      // Run setters
      this[key](params[key]);
    }

    return this;
  }

  /**
   * Set the response body
   * @version 1.0.0
   * @since   2.0.0
   * @param   {String|Function}  body [description]
   * @return  {ResponseConfigurator}  this
   */
  body(body) {
    let response = this._getCurrentResponseSet();

    if (body === false) delete response.body;
    else response.body = body;

    return this;
  }

  /**
   * Set the time the server will wait before sending back response
   * @version 1.0.0
   * @since   2.0.0
   * @param   {Boolean|Number}  delay Delay in ms or false to remove delay
   * @return  {ResponseConfigurator}  this
   * @see {@link Fixture#sleep}
   */
  delay(delay) {
    let response = this._getCurrentResponseSet();

    if (delay === false) delete response.delay;
    else response.delay = parseInt(delay, 10);

    return this;
  }

  /**
   * Set a specific header value
   *
   * @version 1.0.0
   * @since   2.2.0
   * @param   {String}  name           Header name
   * @param   {String}  content        Header content
   * @param   {Boolean} [append=false] If `true`, the content will be appended to header, otherwise it replaces current value
   * @return  {ResponseConfigurator}  this
   */
  header(name, content, append = false) {
    const response = this._getCurrentResponseSet();

    if (!(response.headers instanceof Headers)) response.headers = new Headers();

    if (append) response.headers.append(name, content);
    else response.headers.set(name, content);

    return this;
  }

  /**
   * One time setter for all headers
   *
   * It can accept object or an header instance
   *
   * @version 1.0.1
   * @since   2.0.0
   * @param   {Object|Headers|Boolean}  [headers={}] Headers. Passing false will remove all headers and passing nothing will reset all headers
   * @return  {ResponseConfigurator}  this
   */
  headers(headers = {}) {
    if (headers && !(headers instanceof Object || headers instanceof Headers)) {
      throw new Error('Headers must be an object or an Headers instance');
    }

    if (headers instanceof Object) headers = new Headers(headers);

    let response = this._getCurrentResponseSet();

    if (headers === false) delete response.headers;
    else response.headers = headers;

    return this;
  }

  /**
   * Set the response status
   * @version 1.0.0
   * @since   2.0.0
   * @param   {Number}  status Status code
   * @return  {ResponseConfigurator}  this
   */
  status(status) {
    let response = this._getCurrentResponseSet();

    if (status === false) delete response.status;
    else response.status = parseInt(status, 10);

    return this;
  }

  /**
   * Set the response status text
   * @version 1.0.0
   * @since   2.0.0
   * @param   {String}  text Status text
   * @return  {ResponseConfigurator}  this
   */
  statusText(text) {
    let response = this._getCurrentResponseSet();

    if (text === false) delete response.statusText;
    else response.statusText = text;

    return this;
  }

  /**
   * Set the response body wrapper
   * @version 1.0.0
   * @since   2.0.0
   * @param   {Function|Boolean}  wrapper Response body wrapper
   * @return  {ResponseConfigurator}  this
   */
  wrapper(wrapper) {
    let response = this._getCurrentResponseSet();

    if (wrapper === false) delete response.wrapper;
    else response.wrapper = wrapper;

    return this;
  }

  /**
   * Set the pattern that will be used to match the request
   * @version 1.0.0
   * @since   2.0.0
   * @param   {String}  pattern Pattern
   * @return  {ResponseConfigurator}  this
   * @see Pattern{../../manual/response-configuration.html#using-patterns}
   */
  pattern(pattern) {
    let response = this._getCurrentResponseSet();

    if (pattern === false) delete response.pattern;
    else response.pattern = pattern;

    return this;
  }

  /**
   * Set the before callback
   * @version 1.0.0
   * @since   2.0.0
   * @param   {Function} cb Callback
   * @return  {ResponseConfigurator}  this
   */
  before(cb) {
    if (cb && !(cb instanceof Function)) {
      throw new Error('Before hook must be a function');
    }

    let response = this._getCurrentResponseSet();

    if (cb === false) delete response.before;
    else response.before = cb;

    return this;
  }

  /**
   * Set the after callback
   * @version 1.0.0
   * @since   2.0.0
   * @param   {Function} cb Callback
   * @return  {ResponseConfigurator}  this
   */
  after(cb) {
    if (cb && !(cb instanceof Function)) {
      throw new Error('Before hook must be a function');
    }

    let response = this._getCurrentResponseSet();

    if (cb === false) delete response.after;
    else response.after = cb;

    return this;
  }
}

export default ResponseConfigurator
