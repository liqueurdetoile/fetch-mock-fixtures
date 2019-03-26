/**
 * Main fixture constructor
 * @version 1.0.0
 * @since 1.0.0
 * @author Liqueur de Toile <contact@liqueurdetoile.com>
 */
export default class Fixture {
  /**
   * Server instance
   * @type {Server}
   */
  server = null;

  /**
   * Response body
   * @type {mixed}
   */
  body = null;

  /**
   * Response status
   * @type {Number}
   */
  status = null;

  /**
   * Response status text
   * @type {String}
   */
  statusText = null;

  /**
   * Response headers
   * @type {Headers}
   */
  headers = null;

  /**
   * Response wrapper
   * @type {Boolean|String|Function}
   */
  wrapper = false;

  /**
   * Ficture constructor
   * @version 1.0.0
   * @since   1.0.0
   * @param   {Server}  server Server instance
   */
  constructor(server) {
    this.server = server;
    // Copy server wrap method
    this.wrap = server.wrap;

    this.headers = server.headers;
    this.status = server.status;
    this.statusText = server.statusText;
    this.wrapper = server.wrapper;
  }

  /**
   * Returns the response object based on fixture properties
   * @version 1.0.0
   * @since   1.0.0
   * @return  {response}  Response object
   */
  get response() {
    return new Response(this.wrap(this.body), {
      headers: this.headers,
      status: this.status,
      statusText: this.statusText
    });
  }
}
