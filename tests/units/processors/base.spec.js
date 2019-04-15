import BaseProcessor from '@/processors/BaseProcessor';

describe('Processors test suite', function() {
  describe('Base processor evaluation methods', function() {
    const p = new BaseProcessor();

    describe('Equality', function() {
      it('should evaluate equality of strings', async function() {
        let current = 'test';
        let expected = 'test';

        (await p._equal(current, expected)).should.be.true;
      })

      it('should evaluate equality of numbers', async function() {
        let current = '1';
        let expected = 1;

        (await p._equal(current, expected)).should.be.true;
      })

      it('should evaluate equality of booleans', async function() {
        let current = 'true';
        let expected = true;

        (await p._equal(current, expected)).should.be.true;
      })

      it('should execute reg exp', async function() {
        let current = 'bar is a foo baz';
        let expected = /foo/;

        (await p._equal(current, expected)).should.be.true;
      })

      it('should execute callback', async function() {
        let current = 'bar is a foo baz';
        let expected = current => current.indexOf('foo') > 0;

        (await p._equal(current, expected)).should.be.true;
      })

      it('should execute async callback', async function() {
        let current = 'bar is a foo baz';
        let expected = async current => current.indexOf('foo') > 0;

        (await p._equal(current, expected)).should.be.true;
      })
    })
  })
})
