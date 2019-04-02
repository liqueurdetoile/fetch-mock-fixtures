import {Server} from '@';
import server from './server';
import PouchDB from 'pouchdb';

describe('Fixtures testing suite', function() {
  beforeEach(() => server.start());
  afterEach(() => {
    server.reset().stop();
  });

  describe('Fixture errors', function() {
    it('should throw an exception if no loader have been set', async function() {
      let server = new Server();

      server.respondWithFixture();
      let response = await fetch('/');
      response.status.should.equal(500);
      response.statusText.should.equal("Fixture loader have not been implemented. See readme for more informations.")
    })

    it('should warn if old loader have been set', async function() {
      let server = new Server();

      sinon.spy(console, 'warn');
      server._getFixtureParams = () => true;
      server.respondWithFixture();

      await fetch('/');

      console.warn.calledOnceWith('_getFixtureParams have been deprecated and will be removed in next versions. Please use getFixtureParams instead.').should.be.true; // eslint-disable-line
      console.warn.restore(); // eslint-disable-line
    })

    it('should throw an exception if no arguments are provided to fetch', async function() {
      server.respondWithFixture();

      try {
        await fetch();
      } catch (err) {
        err.toString().should.equal('Error: You must either provide a path or a fixture initialization object to fetch call');
      }
    });
  })

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
        this.headers = {
          'content-type': 'text/html'
        }
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

      await db.put({
        _id: '2',
        name: 'bar'
      });
    });

    after(() => {
      db.destroy();
    })

    it('should use a pattern to extract path params and use database', async function() {
      server
        .setFixturePattern('/api2/users/:id?')
        .respondWithFixture();

      let response = await fetch('/api2/users/1');
      let data = await response.json();

      response.status.should.equal(200);
      expect(data.name).to.equal('foo');
    })
  });
})
