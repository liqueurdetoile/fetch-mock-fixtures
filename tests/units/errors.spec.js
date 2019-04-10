import {Server} from '@';

const server = new Server();

describe('Errors management', function() {
  before(() => server.start())
  beforeEach(() => server.reset())
  after(() => server.stop())

  describe('Server errors', function() {
    it('should be set to throw on error by default', async function() {
      try {
        await fetch();
        expect.fail('Error not thrown');
      } catch (err) {
        err.should.be.instanceof(Error);
      }
    })

    it('should be set to respond with 500 error when failing', async function() {
      server.throwOnError(false);

      const response = await fetch();

      response.status.should.equal(500);
    })
  })
})
