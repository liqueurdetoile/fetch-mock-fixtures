import {Server} from '@';

const server = new Server();

describe('Log and verbose tests', function() {
  before(() => server.start());
  afterEach(() => server.reset());
  after(() => server.stop());

  it('should log request/response/error', async function() {
    server.warnOnError(false);
    await fetch('/api/log');
    server.respond.with.preset('default');
    await fetch('/api/log');

    server.history.logs.should.deep.equal([
      'Request : GET http://localhost:9876/api/log',
      'FMF error: No fixtures defined',
      'Request : GET http://localhost:9876/api/log',
      'Response sent (200 OK)'
    ])
  })

  it('should log and verbose request/response/error', async function() {
    sinon.stub(console, 'log');

    server.warnOnError(false).verbose(true);
    await fetch('/api/log');
    server.respond.with.preset('default');
    await fetch('/api/log');

    console.log.args.should.deep.equal([ // eslint-disable-line
      ['Request : GET http://localhost:9876/api/log'],
      ['FMF error: No fixtures defined'],
      ['Request : GET http://localhost:9876/api/log'],
      ['Response sent (200 OK)']
    ])

    console.log.restore(); // eslint-disable-line
  })
})
