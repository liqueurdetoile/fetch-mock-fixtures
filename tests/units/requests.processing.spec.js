import {Server} from '@';

const server = new Server();

describe('Request processing test suite', function() {
  before(() => {
    server.start();
  })

  afterEach(() => server.reset());

  after(() => server.stop());

  it('should throw if no fixtures defined', async function() {
    try {
      server.warnOnError(false);
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
      .to.thirdCall().with.status(204)
      .to.any.with.body('Other calls').and.status(206);

    let response;

    response = await fetch('/');
    response.status.should.equal(201);
    response = await fetch('/');
    response.status.should.equal(203);
    response = await fetch('/');
    response.status.should.equal(204);
    response = await fetch('/');
    response.status.should.equal(206);
  })

  it('should parse body of request for matching', async function() {
    server
      .throwOnError(true)
      .when.pathname.equal('/text')
      .and.body('text').equal('test')
      .respond.with.status('200')
      .when.pathname.equal('/json')
      .and.body('json').equal({test: true})
      .respond.with.status('200')
      .when.pathname.equal('/formdata')
      .and.body('formData').equal(data => data instanceof FormData)
      .respond.with.status('200')
      .when.pathname.equal('/blob')
      .and.body('blob').equal(blob => blob instanceof Blob)
      .respond.with.status('200')
      .when.pathname.equal('/arraybuffer')
      .and.body('arrayBuffer').equal(ab => ab instanceof ArrayBuffer)
      .respond.with.status('200')
      .fallback.to.preset(400);

    let response;

    response = await fetch('/text', {method: 'POST', body: 'test'});
    response.status.should.equal(200);

    response = await fetch('/json', {method: 'POST', body: JSON.stringify({test: true})});
    response.status.should.equal(200);

    let r = server.request;
    if (r.formData instanceof Function) {
      let body = new FormData();
      body.append('test', true);
      response = await fetch('/formdata', {
        method: 'POST',
        body
      });
      response.status.should.equal(200);
    } else {
      console.warn('"Skip test on parsing body as formData as is not supported by this browser'); // eslint-disable-line
    }

    response = await fetch('/blob', {
      method: 'POST',
      body: new Blob()
    });
    response.status.should.equal(200);

    response = await fetch('/arraybuffer', {
      method: 'POST',
      body: new ArrayBuffer()
    });
    response.status.should.equal(200);
  })

  it  ('should delay response', async function() {
    server.respond.with.preset('json').body({test: true}).delay(500);

    const start = +new Date();
    const response = await fetch('/');
    const end = +new Date();
    const delay = end - start;

    response.status.should.equal(200);
    expect(delay >= 500).true;
  })

  it('should negate request matching', async function() {
    server
      .on.pathname.not.equal('/login')
      .respond.with.status(200)
      .respond.with.status(401);

    let response

    response = await fetch('/login');
    response.status.should.equal(401)

    response = await fetch('/notlogin');
    response.status.should.equal(200)
  })
})
