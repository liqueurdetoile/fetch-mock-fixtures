import {Server} from '@';
import PouchDB from 'pouchdb';

describe('Fixtures testing suite', function() {
  let server = new Server();

  beforeEach(() => server.start());
  afterEach(() => {
    server.stop();
    server.reset();
  });

  describe('Fixture path resolution', function() {
    it('should provide fixture path', async function() {
      await fetch('/api/users');

      server.fixture.should.equal('api/users/get');
    })
  });

  describe('Fixture loading', function() {
    it('should load fixture and GET', async function() {
      server
        .setHeaders({'content-type': 'application/json'})
        .setWrapper(body => JSON.stringify(body))
        .respondWithFixture();

      let response = await fetch('/api/users');

      response.status.should.equal(200);

      let data = await response.json();

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
    })

    it('should load fixture and POST', async function() {
      server
        .setHeaders({'content-type': 'application/json'})
        .setWrapper(body => JSON.stringify(body))
        .respondWithFixture();

      let response = await fetch('/api/users', {method: 'POST'});

      response.status.should.equal(201);

      let data = await response.json();

      data.should.deep.equal({
        id: 3,
        name: 'baz'
      });
    })

    it('should load fixture and fail', async function() {
      server
        .setHeaders({'content-type': 'application/json'})
        .setWrapper(body => JSON.stringify(body))
        .respondWithFixture();

      let response = await fetch('/api/silly');

      response.status.should.equal(404);
    })
  })

  describe('On the fly fixture', function() {
    it('should use an on-the-fly fixture', async function() {
      const fixture = {};
      const destroyed = sinon.spy();

      fixture.initialized = function() {
        this.body = 'test';
      }

      fixture.destroyed = () => {
        destroyed();
      }

      server.setDelay(500).respondWithFixture();

      let response = await fetch(fixture);
      let data = await response.text();

      response.status.should.equal(200);
      data.should.equal('test');
      destroyed.calledOnce.should.be.true;
    })
  });

  describe('Pattern and database fixture', function() {
    let db;

    before(async () => {
      db = new PouchDB('test');

      await db.put({
        _id: '1',
        name: 'foo'
      });
    });

    after(() => {
      db.destroy();
    })

    it('should use a pattern to extract path params and use database', async function() {
      server
        .setFixturePattern('/api2/users/:id')
        .respondWithFixture();

      let response = await fetch('/api2/users/1');
      let data = await response.json();

      response.status.should.equal(200);
      expect(data.name).to.equal('foo');
    })
  });
})
