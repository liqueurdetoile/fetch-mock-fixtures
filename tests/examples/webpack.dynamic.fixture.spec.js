import Server from '@';
import PouchDB from 'pouchdb';

const server = new Server();
let db;

describe('Webpack dynamic fixture example', function() {
  before(async () => {
    // Create data set
    db = new PouchDB('test');

    await db.put({
      _id: '1',
      id: 1,
      name: 'foo'
    });

    await db.put({
      _id: '2',
      id: 2,
      name: 'bar'
    });

    server.start().respond.with.preset('webpack');
  })

  after(() => {
    server.stop();
    db.destroy();
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
