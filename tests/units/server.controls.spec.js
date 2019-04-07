import {Server} from '@';

describe('Server control test suite', function() {
  it('should construct a server', function() {
    const server = new Server();

    server.should.be.instanceof(Server);
  })

  it('should start, reset and stop server', function() {
    const server = new Server();

    server.running.should.be.false;
    server.start().should.deep.equal(server);
    server.running.should.be.true;
    server.reset().should.deep.equal(server);
    server.running.should.be.true;
    server.stop().should.deep.equal(server);
    server.running.should.be.false;
  })

  it('should expose stub when running and throw when not running', function() {
    const server = new Server();

    expect(() => server.stub).to.throw();
    server.start()
    server.stub.should.be.instanceof(Function);
  })
})
