import {Fixture, Server} from '@';

const p1 = {
  body: null,
  delay: 0,
  headers: new Headers({'content-type': 'application/json'}),
  status: 200,
  statusText: 'OK',
  wrapper: '%data%',
  pattern: 'pattern',
  before: () => 'before',
  after: () => 'after'
};

const p2 = {
  body: 'test',
  delay: 1000,
  headers: false,
  status: 200,
  statusText: 'OK',
  wrapper: false,
  pattern: false,
  before: false,
  after: false
}

const r2 = {
  body: 'test',
  delay: 1000,
  status: 200,
  statusText: 'OK'
}

let server;

describe('Respond test suite', function() {
  beforeEach(function() {
    server = new Server();
  });

  it('should create a blank fixture and register it', function() {
    const f = server.respond;

    f.should.be.instanceof(Fixture);
    server._fixtures[0].should.deep.equal(f);
  })

  it('should set a default response', function() {
    server.respond.set(p1);
    server._fixtures[0]._any.should.deep.equal(p1);
  })

  it('should update default response', function() {
    server.respond.set(p1).set(p2);
    server._fixtures[0]._any.should.deep.equal(r2);
  })

  it('should change default response again', function() {
    server.respond.set(p1);
    server.respond.set(p2);
    server._fixtures.length.should.equal(1);
    server._fixtures[0]._any.should.deep.equal(r2);
  })

  it('should register ordered responses with global call count', function() {
    server.respond.set(p1);
    server._fixtures[0]._any.should.deep.equal(p1);
    server.respond.to.firstCall().set(p2)
    server._fixtures[0].globalCalls[1].should.deep.equal(r2);
  })

  it('should register ordered responses with own call count', function() {
    server.respond.set(p1);
    server._fixtures[0]._any.should.deep.equal(p1);
    server.respond.to.firstCall(true).set(p2)
    server._fixtures[0].ownCalls[1].should.deep.equal(r2);
  })
});
