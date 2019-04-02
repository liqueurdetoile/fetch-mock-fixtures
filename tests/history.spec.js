import Server from '@';

describe('Requests history and successive calls test suite', function() {
  let server = new Server();

  beforeEach(() => {
    server.start();
  })

  afterEach(() => {
    server.reset().stop();
  })

  describe('Requests history', function() {
    it('should return the number of requests processed', async function() {
      await fetch('/');
      server.callCount.should.equal(1);
      await fetch('/');
      server.callCount.should.equal(2);
      await fetch('/');
      server.callCount.should.equal(3);
    })

    it('should return request history by index', async function() {
      server.respondWith('test')

      await fetch('/');

      expect(server.url.pathname === '/').to.be.true;
      expect(server.request.url === server.getRequest(0).url).to.be.true;

      await fetch('/foo');

      expect(server.url.pathname === '/foo').to.be.true;
      expect(server.request.url === server.getRequest(0).url).to.be.false;
      expect(server.request.url === server.getRequest(1).url).to.be.true;
      expect(server.requestToUrl(server.getRequest(0)).pathname).to.equal('/');
    })

    it('should return whole requests history', async function() {
      await fetch('/');
      await fetch('/foo');
      await fetch('/bar');

      let requests = server.getAllRequests().map(req => server.requestToUrl(req).pathname);

      requests.should.deep.equal([
        '/',
        '/foo',
        '/bar'
      ]);
    })
  });

  describe('Successive different responses', function() {
    it('should chain responses', async function() {
      server
        .onFirstCall()
        .respondWith('test1')
        .onSecondCall()
        .respondWith('test2')
        .onThirdCall()
        .respondWith('test3')
        .onCall(3)
        .respondWith('test4')
        .respondWith('over')

      let response;

      response = await fetch('/');
      expect(await response.text()).to.equal('test1');

      response = await fetch('/');
      expect(await response.text()).to.equal('test2');

      response = await fetch('/');
      expect(await response.text()).to.equal('test3');

      response = await fetch('/');
      expect(await response.text()).to.equal('test4');

      response = await fetch('/');
      expect(await response.text()).to.equal('over');

      response = await fetch('/');
      expect(await response.text()).to.equal('over');
    })

    it('should chain responses and fixtures', async function() {
      let fixture = {
        body: function(server) {
          return server.callCount;
        }
      }

      server
        .onFirstCall()
        .respondWithFixture()
        .onCall(2)
        .respondWithFixture()
        .respondWithStatus(504);

      let response;

      response = await fetch(fixture);
      response.status.should.equal(200);

      response = await fetch(fixture);
      response.status.should.equal(504);

      response = await fetch(fixture);
      response.status.should.equal(200);

      response = await fetch(fixture);
      response.status.should.equal(504);
    })

    it('should mutate/inherit params between responses', async function() {
      server
        .onFirstCall()
        .setStatus(404)
        .respondWith(null)
        .onSecondCall()
        .setStatus(200)
        .respondWith(null)
        .setStatus(204)
        .respondWith(null)

      let response;

      response = await fetch();
      response.status.should.equal(404);

      response = await fetch();
      response.status.should.equal(200);

      response = await fetch();
      response.status.should.equal(204);
    })
  })
})
