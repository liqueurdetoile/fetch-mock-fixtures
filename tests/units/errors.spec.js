import {Server} from '@';

const server = new Server();

describe('Errors management', function() {
  before(() => server.start())
  beforeEach(() => server.reset())
  after(() => server.stop())

  describe('Server warnings', function() {
    beforeEach(() => sinon.stub(console, 'warn'))
    afterEach(() => console.warn.restore()) // eslint-disable-line

    it('should warn on error by default', async function() {
      await fetch()
      console.warn.calledOnce.should.be.true; // eslint-disable-line
    })

    it('should be set to not warn on error', async function() {
      server.warnOnError(false);
      await fetch();
      console.warn.calledOnce.should.be.false; // eslint-disable-line
    })
  })

  describe('Server errors', function() {
    it('should respond with 500 error when process failing', async function() {
      const response = await fetch();

      response.status.should.equal(500);
    })

    it('should be set to throw on error', async function() {
      let thrown = false;

      server.throwOnError(true);

      try {
        await fetch();
      } catch (err) {
        err.should.be.instanceof(Error);
        thrown = true;
      }

      if (!thrown) expect.fail('Error not thrown');
    })
  })
})
