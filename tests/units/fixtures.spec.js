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

      const responseObject = await f.getResponse(request);

      before.calledOnceWithExactly(server, request, response).should.be.true;
      body.calledOnceWithExactly({id: '1'}, request, server).should.true;
      after.calledOnceWithExactly(server, responseObject).should.be.true;
    })
  })
})
