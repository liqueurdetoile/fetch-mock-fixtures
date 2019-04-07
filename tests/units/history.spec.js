import Server from '@';

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
    server.request.should.be.instanceof(Request);
    server.response.should.be.instanceof(Response);
  })

  it('should have cloned response before body parsing', function() {
    server.history.response.first.should.be.instanceof(Response);
    server.history.response.first.bodyUsed.should.be.false;
  })
})
