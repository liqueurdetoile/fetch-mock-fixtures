import {FMFRequest, Fixture, Server} from '@';
import RequestMatcher from '@/helpers/RequestMatcher';

const server = new Server();

describe('Fixtures test suite', function() {
  before(() => server.start())
  afterEach(() => server.reset())
  after(() => server.stop());

  describe('Fixture configuration', function() {
    it('should create a fixture', function() {
      const f = new Fixture(server);

      f.should.be.instanceof(Fixture);
      expect(f._matcher).to.be.null;
      f.on.should.be.instanceof(RequestMatcher);
      f.on.should.deep.equal(f._matcher);
      f.respond.should.deep.equal(f);
    })
  })

  describe('Fixture requests processing', function() {
    it('should process fixture lifecyle', async function() {
      const request = new FMFRequest('/api/v1/users/1');
      const f = new Fixture(server);
      const before = sinon.spy();
      const body = sinon.spy();
      const after = sinon.spy();
      const response = {
        pattern: '/api/v1/users/:id?',
        before,
        body,
        after
      };

      f.respond.set(response)

      await f.getResponse(request);

      before.calledOnce.should.be.true;
      body.calledOnce.should.true;
      after.calledOnce.should.be.true;
    })

    it('should alter response from before response callback', async function() {
      server.respond.with.preset('default');

      let response = await fetch('/api/v1/users/1');
      response.status.should.equal(200);

      server.respond.before(() => ({
        status: 404
      }));

      response = await fetch('/api/v1/users/1');
      response.status.should.equal(404);
    })

    it('should use a preset if one is thrown in fixture lifecycle', async function() {
      server.respond
        .with.preset('default')
        .before(server => {
          throw server.preset(404)
        });

      let response = await fetch('/api/v1/users/1');
      response.status.should.equal(404);
    })

    it('should use a Response instance if one is thrown in fixture lifecycle', async function() {
      server.respond
        .with.preset('default')
        .body(() => {
          throw new Response(null, {status: 404});
        });

      let response = await fetch('/api/v1/users/1');
      response.status.should.equal(404);
    })

    it('should use a response object descriptor if one is thrown in fixture lifecycle', async function() {
      server.respond
        .with.preset('default')
        .after(() => {
          throw {status: 404}
        });

      let response = await fetch('/api/v1/users/1');
      response.status.should.equal(404);
    })

    it('should throw on Error', async function() {
      let response;

      server
        .warnOnError(false)
        .throwOnError(true)
        .respond
        .with.preset('default')
        .before(() => {
          throw new TypeError()
        });

      try {
        response = await fetch('/api/v1/users/1');
      } catch (err) {
        err.should.be.instanceof(Error);
        err.previous.should.be.instanceof(TypeError);
      }

      expect(response).to.be.undefined;
    })

    it('should return a 500 error for Error throws', async function() {
      server
        .throwOnError(false)
        .respond
        .with.preset('default')
        .before(() => {
          throw new TypeError()
        });

      let response = await fetch('/api/v1/users/1');
      response.status.should.equal(500);
      response.statusText.should.equal('FMF error: Unable to process before callback');
    })

    it('should throw by default for other throws', async function() {
      let response;

      server
        .throwOnError(true)
        .respond
        .with.preset('default')
        .before(() => {
          throw 'My custom error'
        });

      try {
        response = await fetch('/api/v1/users/1');
      } catch (err) {
        err.toString().should.equal('FMF error: Unable to process before callback');
        err.previous.should.equal('My custom error');
      }

      expect(response).to.be.undefined;
    })

    it('should return a 500 error for other throws', async function() {
      server
        .throwOnError(false)
        .respond
        .with.preset('default')
        .before(() => {
          throw 'My custom error'
        });

      let response = await fetch('/api/v1/users/1');
      response.status.should.equal(500);
    })

    it('should throw when asked to', async function() {
      server
        .throwOnError(true)
        .respond
        .throw('failed')

      try {
        await fetch('/api/v1/users/1');
        expect.fail();
      } catch (err) {
        err.message.should.equal('failed');
      }
    })

    it('should throw when trying to go to fallback from a request matcher', function() {
      let f = () => server
        .on.pathname.equal('/')
        .fallback;

      expect(f).to.throw();
    })
  })

  /**
   * @test {ResponseConfigurator#pattern}
   */
  describe('Fixture patterns', function() {
    it('should handle patterns', async function() {
      let croot, cid;

      server
        .throwOnError(true)
        .on
        .pathname.equal(/tests/)
        .respond
        .pattern('/api/v1/:root?/tests/:id?')
        .body(({root, id}) => {
          croot = root;
          cid = id;
        });

      await fetch('/api/v1/tests');
      expect(croot).to.be.undefined;
      expect(cid).to.be.undefined;

      await fetch('/api/v1/tests/d01fea9b-251b-4b48-a4fe-a4a9ab3ef420');
      expect(croot).to.be.undefined;
      expect(cid).to.equal('d01fea9b-251b-4b48-a4fe-a4a9ab3ef420');

      await fetch('/api/v1/admin/tests/d01fea9b-251b-4b48-a4fe-a4a9ab3ef421');
      expect(croot).to.equal('admin');
      expect(cid).to.equal('d01fea9b-251b-4b48-a4fe-a4a9ab3ef421');
    });
  })
})
