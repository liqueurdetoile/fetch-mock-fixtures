import {Server} from '@';

const server = new Server();

describe('Request processing test suite', function() {
  beforeEach(() => {
    server.start();
  })

  afterEach(() => server.reset().stop());

  it('should throw if no fixtures defined', async function() {
    try {
      await fetch('/');
    } catch (err) {
      err.should.be.instanceof(Error);
    }
  })

  it('should throw if no matching fixtures found', async function() {
    server
      .on
      .method.is.equal('POST')
      .respond
      .with.status(201)

    try {
      await fetch('/');
    } catch (err) {
      err.should.be.instanceof(Error);
    }
  })

  it('Should reset between calls', async function() {
    let response;

    server.respond.with.preset('json').and.body({test: true});
    response = await fetch('/');
    response.headers.get('content-type').should.equal('application/json');

    server
      .reset()
      .respond.with.preset('default');

    response = await fetch('/');
    response.headers.get('content-type').should.equal('text/html');
  })

  it('should return response build from fixture', async function() {
    server.respond.with.preset('json').and.body({test: true});

    const response = await fetch('/');

    response.headers.get('content-type').should.equal('application/json');

    const data = await response.json();
    data.test.should.be.true;
  })

  it('should return ordered responses', async function() {
    server
      .respond
      .to.firstCall().with.body('first global call').and.status(201)
      .to.call(2).with.body('Second global call. ** never see. Overriden by local call ** ').and.status(202)
      .to.secondCall(true).with.body('Second local call').and.status(203)
      .to.any.with.body('Other calls').and.status(206);

    let response;

    response = await fetch('/');
    response.status.should.equal(201);
    response = await fetch('/');
    response.status.should.equal(203);
    response = await fetch('/');
    response.status.should.equal(206);
    response = await fetch('/');
    response.status.should.equal(206);
  })

  it('should parse body of request for matching', async function() {
    server
      .on.body('text').equal('test')
      .respond.with.status('200')
      .on.body('json', false).equal({test: true})
      .respond.with.status('201')
      .on.body('formData', false).equal(data => data && data.get('test') === 'true')
      .respond.with.status('202')
      .on.body('blob').equal(blob => blob.type === 'application/x-binary')
      .respond.with.status('203');

    let response;

    response = await fetch('/text', {method: 'POST', body: 'test'});
    response.status.should.equal(200);

    response = await fetch('/json', {method: 'POST', body: JSON.stringify({test: true})});
    response.status.should.equal(201);

    let body = new FormData()
    body.append('test', true)

    response = await fetch('/formdata', {
      method: 'POST',
      body
    });
    response.status.should.equal(202);

    response = await fetch('/blob', {
      method: 'POST',
      headers: {'content-type': 'application/x-binary'},
      body: new Blob()
    });
    response.status.should.equal(203);
  })
})
