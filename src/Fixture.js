export default class Fixture {
  server = null;

  body = null;
  status = null;
  statusText = null;
  headers = null;
  wrapper = false;

  constructor(server) {
    this.server = server;
    // Copy server wrap method
    this.wrap = server.wrap;

    this.headers = server.headers;
    this.status = server.status;
    this.statusText = server.statusText;
    this.wrapper = server.wrapper;
  }

  get response() {
    return new Response(this.wrap(this.body), {
      headers: this.headers,
      status: this.status,
      statusText: this.statusText
    });
  }
}
