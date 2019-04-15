import {FMFRequest, Server} from '@';

const server = new Server();

describe('History test suite', function() {
  before(async () => {
    server.start()
    server.respond.with.preset('default');

    await (await fetch('/1')).text();
    await fetch('/2');
    await fetch('/3');
    await fetch('/4');
    await fetch('/5');
  })
  after(() => server.stop())

  it('should get last request and response', function() {
    server.request.should.be.instanceof(FMFRequest);
    server.request.pathname.should.equal('/5');
    server.response.should.be.instanceof(Response);
  })

  it('should get nth request', function() {
    server.history.first.request.pathname.should.equal('/1');
    server.history.second.request.pathname.should.equal('/2');
    server.history.third.request.pathname.should.equal('/3');
    server.history.request.atCall(4).pathname.should.equal('/4');
  })

  it('should have cloned response before body parsing', function() {
    server.history.response.first.should.be.instanceof(Response);
    server.history.response.first.bodyUsed.should.be.false;
  })

  it('should return all history, all requests or all responses', function() {
    server.history.all().length.should.equal(5);
    server.history.all()[0].request.should.exist;
    server.history.all()[0].response.should.exist;

    server.history.request.all().length.should.equal(5);
    server.history.request.all()[0].should.be.instanceof(FMFRequest);

    server.history.response.all().length.should.equal(5);
    server.history.response.all()[0].should.be.instanceof(Response);
  })
})
