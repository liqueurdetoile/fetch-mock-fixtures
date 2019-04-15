import FMFRequest from '@/helpers/FMFRequest';
import Fixture from '@/Fixture';
import RequestMatcher from '@/helpers/RequestMatcher';
import BaseProcessor from '@/processors/BaseProcessor';
import BooleanProcessor from '@/processors/BooleanProcessor';
import BodyProcessor from '@/processors/BodyProcessor';
import HeadersProcessor from '@/processors/HeadersProcessor';
import QueryProcessor from '@/processors/QueryProcessor';
import StringProcessor from '@/processors/StringProcessor';

describe('Request configurator test suite', function() {
  it('should create a matcher', function() {
    const f = new Fixture();

    f.on.should.be.instanceof(RequestMatcher);
    f.on.on.should.deep.equal(f._matcher);
  })

  it('should throw on unsupported FMFRequest property', function() {
    const f = new Fixture();

    expect(() => f.on.bugsy).to.throw();
    expect(() => f.on.equal({bugsy: true})).to.throw();
  })

  it('should return a processor', function() {
    const f = new Fixture();

    f.on.method.should.be.instanceof(BaseProcessor);
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

  it('should provide the right processor', function() {
    const f = new Fixture();

    f.on.equal({}).should.deep.equal(f._matcher);
    f.on.body().should.be.instanceof(BodyProcessor);
    f.on.headers.should.be.instanceof(HeadersProcessor);
    f.on.header().should.be.instanceof(HeadersProcessor);
    f.on.query.should.be.instanceof(QueryProcessor);
    f.on.slashes.should.be.instanceof(BooleanProcessor);

    [
      'method', 'url', 'destination', 'referrer', 'referrerPolicy', 'mode',
      'credentials', 'redirect', 'integrity', 'cache',
      'protocol', 'auth', 'username', 'password', 'host', 'hostname', 'port',
      'pathname', 'hash', 'href', 'method'
    ].forEach(key => f.on[key].should.be.instanceof(StringProcessor));
  })

  it('should throw is equal argument is not and object when called on matcher', function() {
    const f = new Fixture();

    expect(f.on.equal.bind(f, null)).to.throw();
  })

  it('should throw is with invalid key when called on matcher', function() {
    const f = new Fixture();

    expect(f.on.equal.bind(f, {foo: 'bar'})).to.throw();
  })
})
