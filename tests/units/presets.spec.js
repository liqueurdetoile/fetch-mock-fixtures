import {Preset, Server, presets} from '@';

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
    server._presets['test'].should.equal(preset);
    preset = server.preset('test', p2);
    server._presets['test'].should.equal(preset);
    preset._any.should.deep.equal(r2);
  })

  it('should configure preset with BDD style', function() {
    let preset = server.preset('test').delay(5000);

    preset._any.delay.should.equal(5000);
  })

  it('should delete preset', function() {
    server.preset('test').remove();

    expect(server._presets.test).to.be.undefined;
  })

  it('should throw if name is not provided', function() {
    expect(server.preset.bind(server)).to.throw();
  })

  it('should throw if params are not an object', function() {
    expect(server.preset.bind(server, 'test', 'foo')).to.throw();
  })

  it('should add presets app-wide (manual way)', function() {
    presets.apisuccess = {
      status: 201
    };

    const server = new Server();
    server._presets.apisuccess.should.exist;
  })

  it('should register a preset globally', function() {
    let preset = server.preset('test').delay(5000);

    preset.register();
    presets.test.delay.should.equal(5000);
  })

  it('should unregister global presets', function() {
    server.preset('test').unregister();
    expect(server._presets.test).to.be.instanceof(Object);
    expect(presets.test).to.be.undefined;
  })
});
