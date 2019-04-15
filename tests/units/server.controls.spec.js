import {Server, Fixture} from '@';

describe('Server control test suite', function() {
  it('should construct a server', function() {
    const server = new Server();

    server.should.be.instanceof(Server);
  })

  it('should start, reset and stop server', function() {
    const server = new Server();
    sinon.spy(server, 'reset');

    server.running.should.be.false;
    server.start().should.deep.equal(server);
    server.running.should.be.true;
    server.reset().should.deep.equal(server);
    server.reset.calledOnce.should.be.true;
    server.running.should.be.true;
    server.stop().should.deep.equal(server);
    server.running.should.be.false;
    server.reset.calledTwice.should.be.false;
    server.stop(true).should.deep.equal(server);
    server.reset.calledTwice.should.be.true;
  })

  it('should expose stub when running and throw when not running', function() {
    const server = new Server();

    expect(() => server.stub).to.throw();
    server.start();
    server.stub.should.be.instanceof(Function);
    server.stop();
  })

  it('should import fixtures', async function() {
    const server = new Server();
    const f1 = new Fixture();
    const f2 = {
      on: {
        headers: headers => !headers.has('x-device')
      },
      respond: {
        preset: 400
      }
    }
    let response;

    f1
      .on.equal({
        headers: headers => headers.has('x-device')
      })
      .respond.set({
        status: 200
      })

    server.import(f1);
    server.import([f2]);

    server._fixtures.length.should.equal(2);

    server.start().throwOnError(true);
    response = await fetch('/');
    response.status.should.equal(400);
    response = await fetch('/', {headers: {'x-device': "123"}});
    response.status.should.equal(200);
    server.stop();
  })

  it('should manage import errors', function() {
    const server = new Server();

    expect(server.import.bind(server, 'foo')).to.throw();
    expect(server.import.bind(server, {status: 200})).to.throw();
  })
})
