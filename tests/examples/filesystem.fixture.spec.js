import Server from '@';

const server = new Server();

// Callback to dynamically fetch fixture file based on path
const fetchFixture = function(server, request, response) {
  const path = this.getPath(request, response)
  let newResponse;

  try {
    newResponse = require(`fixtures/${path}.fixture.js`).default;
  } catch (err) {
    throw server.preset(404);
  }

  newResponse = Object.assign({}, response, newResponse)

  return {
    ...newResponse,
    headers: {'content-type': 'application/json'},
    wrapper: body => JSON.stringify(body)
  }
}

describe('Webpack require dynamic fixture example', function() {
  before(() => {
    server.start().respond.before(fetchFixture);
  })

  after(() => {
    server.stop();
  })

  it('should load a fixture without pattern', async function() {
    let response, data;

    response = await fetch('/api/users');
    response.status.should.equal(200);
    data = await response.json();
    data.should.deep.equal([
      {
        id: 1,
        name: 'foo'
      },
      {
        id: 2,
        name: 'bar'
      }
    ]);

    response = await fetch('/api/users/1');
    response.status.should.equal(200);
    data = await response.json();
    data.should.deep.equal({
      id: 1,
      name: 'foo'
    });

    response = await fetch('/api/users', {method: 'POST'});
    response.status.should.equal(201);
    data = await response.json();
    data.should.deep.equal({
      id: 3,
      name: 'baz'
    });

    response = await fetch('/api/users/5');
    response.status.should.equal(404);
  })

  it('should load a fixture with pattern', async function() {
    server.respond.pattern('/api2/users/:id?');

    let response, data;

    response = await fetch('/api2/users');
    response.status.should.equal(200);
    data = await response.json();
    data.should.deep.equal([
      {
        id: 1,
        name: 'foo'
      },
      {
        id: 2,
        name: 'bar'
      }
    ]);

    response = await fetch('/api2/users/1');
    response.status.should.equal(200);
    data = await response.json();
    data.should.deep.equal({
      id: 1,
      name: 'foo'
    });

    response = await fetch('/api2/users/5');
    response.status.should.equal(404);
  })
})
