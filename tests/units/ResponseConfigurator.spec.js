import Fixture from '@/Fixture';

/**
 * @test {ResponseConfigurator}
 */
describe('Response configurator test suite', function() {
  /**
   * @test {ResponseConfigurator#set}
   */
  it('should set/unset a response from object', function() {
    const f = new Fixture();
    const set = {
      headers: new Headers({'content-type': 'application/json'}),
      status: 200,
      statusText: 'OK',
      delay: 1000,
      wrapper: () => {},
      before: () => {},
      after: () => {},
      body: {test: 'ok'},
      pattern: '/:id',
      preset: 200
    }

    const unset = {
      headers: false,
      status: false,
      statusText: false,
      delay: false,
      wrapper: false,
      before: false,
      after: false,
      body: false,
      pattern: false,
      preset: false
    }

    f.respond.set(set);
    f._any.should.deep.equal(set);

    f.respond.set(unset);
    f._any.should.deep.equal({});
  })

  it('should throw with set if argument is not an object', function() {
    const f = new Fixture();

    expect(f.respond.set.bind(f, 'foo')).to.throw();
  })

  it('should throw with set if key is not allowed', function() {
    const f = new Fixture();

    expect(f.respond.set.bind(f, {foo: 'baz'})).to.throw();
  })

  it('should throw if headers are not valid', function() {
    const f = new Fixture();

    expect(f.respond.headers.bind(f, 'foo')).to.throw();
  })

  it('should throw if before and after are not callbacks', function() {
    const f = new Fixture();

    expect(f.respond.before.bind(f, 'foo')).to.throw();
    expect(f.respond.after.bind(f, 'foo')).to.throw();
  })

  /**
   * @test {ResponseConfigurator#header}
   */
  it('should set individual headers', function() {
    const f = new Fixture();

    f.respond.with.header('content-type', 'application/json');

    f._any.headers.get('content-type').should.equal('application/json');

    f.respond.with.header('content-type', 'text/html');

    f._any.headers.get('content-type').should.equal('text/html');

    f.respond.with.header('content-type', 'encoding: UTF-8', true);

    f._any.headers.get('content-type').should.equal('text/html, encoding: UTF-8');
  })
})
