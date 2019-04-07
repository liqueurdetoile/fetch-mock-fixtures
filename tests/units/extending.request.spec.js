import FMFRequest from '@/helpers/FMFRequest';

describe('Extended request test suite', function() {
  it('should create Request from fetch params and expose parsed request properties', function() {
    let r = new FMFRequest('/api/test?param1=true&param2=test', {method: 'GET'});

    r.method.should.equal('GET');
    r.url.should.equal('http://localhost:9876/api/test?param1=true&param2=test');
    r.pathname.should.equal('/api/test');
    r.query.should.deep.equal({
      param1: 'true',
      param2: 'test'
    });
  })

  it('should extend existing Request Object and expose parsed request properties', function() {
    let r = new FMFRequest(new Request('/api/test?param1=true&param2=test', {method: 'GET'}));

    r.method.should.equal('GET');
    r.url.should.equal('http://localhost:9876/api/test?param1=true&param2=test');
    r.pathname.should.equal('/api/test');
    r.query.should.deep.equal({
      param1: 'true',
      param2: 'test'
    });
  })
})
