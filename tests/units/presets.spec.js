import {Preset, Server} from '@';

const p1 = {
  body: null,
  delay: 0,
  headers: new Headers({'content-type': 'application/json'}),
  status: 200,
  statusText: 'OK',
  wrapper: '%data%',
  pattern: 'pattern',
  before: () => 'before',
  after: () => 'after'
};

const r1 = p1;

const p2 = {
  body: 'test',
  delay: 1000,
  headers: false,
  status: 200,
  statusText: 'OK',
  wrapper: false,
  pattern: false,
  before: false,
  after: false
}

const r2 = {
  body: 'test',
  delay: 1000,
  status: 200,
  statusText: 'OK'
}

let server;

describe('Presets test suite', function() {
  beforeEach(function() {
    server = new Server();
  });

  it('should create a blank preset', function() {
    const preset = server.preset('test');

    preset.should.be.instanceof(Preset);
  });

  it('should create a configured preset', function() {
    const preset = server.preset('test', {
      status: 204
    });

    preset._any.should.deep.equal({status: 204});
  });

  it('should update preset', function() {
    let preset;

    preset = server.preset('test', p1);
    preset._any.should.deep.equal(r1);
    preset = server.preset('test', p2);
    preset._any.should.deep.equal(r2);
  })
});
