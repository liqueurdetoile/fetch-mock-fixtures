import FMFRequest from '@/helpers/FMFRequest';
import Fixture from '@/Fixture';
import RequestMatcher from '@/helpers/RequestMatcher';
import AbstractProcessor from '@/processors/AbstractProcessor';
import StringProcessor from '@/processors/AbstractProcessor';

describe('Request configurator test suite', function() {
  it('should create a matcher', function() {
    const f = new Fixture();

    f.on.should.be.instanceof(RequestMatcher);
  })

  it('should throw on unsupported FMFRequest property', function() {
    const f = new Fixture();

    expect(() => f.on.bugsy).to.throw();
  })

  it('should return a processor', function() {
    const f = new Fixture();

    f.on.method.should.be.instanceof(AbstractProcessor);
    f.on._processors.length.should.equal(1);
    f.on._processors[0].should.be.instanceof(StringProcessor);
  })

  it('should process equal', async function () {
    const f = new Fixture();
    const r = new FMFRequest('/');

    f.on.method.equal('GET').should.deep.equal(f._matcher);
    (await f.match(r)).should.be.true;
  })

  it('should process header', async function () {
    const f = new Fixture();
    const r = new FMFRequest('/', {headers: {'content-type': 'application/json'}});

    f.on.header('content-type').equal(/json/).should.deep.equal(f._matcher);
    (await f.match(r)).should.be.true;
  })
})
