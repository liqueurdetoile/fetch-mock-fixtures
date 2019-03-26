import Server from '@';

let response, data;

describe('Mock Server core functionalities testing suite', function () {
  const server = new Server();

  beforeEach(() => server.start());
  afterEach(() => {
    server.stop();
    server.reset();
  });

  describe('Testing initialize', function () {
    it('should initialize and respond 200 to a basic get request', async function () {
      server.respondWith();
      response = await fetch('/');

      response.status.should.equal(200);
    });

    it('should initialize and respond 404 to a basic get request', async function () {
      server.respondWith('', {
        status: 404
      });

      response = await fetch('/');
      response.status.should.equal(404);
    });

    it('should initialize and respond 200 with data to a basic get request', async function () {
      server.respondWith('{"test":"ok"}', {
        status: 200,
        headers: {'content-type': 'application/json'}
      });
      response = await fetch('/');

      response.status.should.equal(200);
      response.headers.get('content-type').should.equal('application/json');
      data = await response.json();
      data.test.should.equal('ok');
    });
  });

  describe('Server response setup', function() {
    it('should initialize default global response parameters', function() {
      server.status.should.equal(200);
      server.statusText.should.equal('OK');
      server.headers.get('content-type').should.equal('text/html');
      server.wrapper.should.be.false;
    })

    it('should initialize global response parameters with configure', function() {
      server.configure({
        status: 404,
        statusText: 'Not Found',
        headers: new Headers({'content-type': 'application/json'}) // could also be called with only Headers constructor arguments
      });

      server.status.should.equal(404);
      server.statusText.should.equal('Not Found');
      server.headers.get('content-type').should.equal('application/json');
      server.wrapper.should.be.false;
    })

    it('should set a delay for response', function() {
      server.configure({
        delay: 2000
      })

      server.delay.should.equal(2000);
    })
  })

  describe('Incoming request informations', function() {
    it('should expose a request object when initialized with data and init object', async function() {
      response = await fetch('/test', {
        headers: {'content-type': 'application/json'},
        body: JSON.stringify('test'),
        method: 'POST'
      });

      server.request.should.be.instanceof(Request);
      server.request.method.should.equal('POST');
      server.request.headers.get('content-type').should.equal('application/json');

      let body = await server.request.json();
      body.should.equal('test');
    })

    it('should expose a cloned request object when initialized with a request object', async function() {
      let request = new Request('/test', {
        headers: {'content-type': 'application/json'},
        body: JSON.stringify('test'),
        method: 'POST'
      });

      await fetch(request);

      expect(server.request === request).to.be.false;
      server.request.should.be.instanceof(Request);
      server.request.method.should.equal('POST');
      server.request.headers.get('content-type').should.equal('application/json');

      let body = await server.request.json();
      body.should.equal('test');
    })

    it('should expose url', async function() {
      await fetch('/test');

      server.url.should.equal('/test');
    });

    it('should expose url with request object', async function() {
      let request = new Request('/test');

      await fetch(request);
      server.url.should.equal('/test');
    });

    it('should expose query', async function() {
      await fetch('/test?t=a');

      server.url.should.equal('/test');
      expect(server.query).to.deep.equal({t: 'a'});
    });

    it('should expose query with request object', async function() {
      let request = new Request('/test?t=a');

      await fetch(request);
      server.url.should.equal('/test');
      expect(server.query).to.deep.equal({t: 'a'});
    });
  })

  describe('Response and status response', function () {
    it('should respond and delay with params', async function () {
      server
        .setDelay(500)
        .respondWith('test');

      let start = + new Date();
      response = await fetch('/');
      let end = + new Date();

      expect((end-start) >= 500).to.be.true;
      response.status.should.equal(200);

      let data = await response.text();

      data.should.equal('test');
    });

    it('should respond with response object', async function () {
      let response = new Response('test');

      server
        .setDelay(500)
        .respondWith(response);

      let start = + new Date();
      response = await fetch('/');
      let end = + new Date();

      expect((end-start) >= 500).to.be.true;
      response.status.should.equal(200);

      let data = await response.text();

      data.should.equal('test');
    });

    it('should respond with status 204', async function () {
      server.respondWithStatus(204);
      response = await fetch('/');
      response.status.should.equal(204);
    });

    it('should respond with status 301', async function () {
      server.respondWithStatus(301);
      response = await fetch('/');
      response.status.should.equal(301);
    });

    it('should respond with status 401', async function () {
      server.respondWithStatus(401);
      response = await fetch('/');
      response.status.should.equal(401);
    });

    it('should respond multiple times with status 401', async function () {
      server.respondWithStatus(401);
      response = await fetch('/');
      response.status.should.equal(401);
      response = await fetch('/');
      response.status.should.equal(401);
    });

    it('should mutate status', async function () {
      server.respondWithStatus(401);
      response = await fetch('/');
      response.status.should.equal(401);
      server.respondWithStatus(200);
      response = await fetch('/');
      response.status.should.equal(200);
    });
  });
});
