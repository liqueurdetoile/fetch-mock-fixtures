import Server from '@';
import PouchDB from 'pouchdb';

let db;

/** Data that will be stored and restored each time in database */
const fixtures = [
  {
    _id: 'users/1',
    id: 1,
    name: 'foo'
  },
  {
    _id: 'users/2',
    id: 1,
    name: 'bar'
  },
  {
    _id: 'objects/1',
    id: '1',
    value: 'object1'
  }
];

/** Callback to search/upsert database */
const fetchFixture = async function(params, {request, response, server}) {
  if (!params.model) throw server.preset(404);

  const get = async function({model, id}) {
    if (id) {
      try {
        const _id = `${model}/${id}`;
        return await db.get(_id);
      } catch (err) {
        throw server.preset(err.status);
      }
    }

    let docs = await db.allDocs({
      include_docs: true
    });

    return docs.rows.filter(row => row.id.indexOf(model) === 0).map(row => row.doc)
  }

  const upsert = async function({model, id}) {
    if (!id && request.method !== 'POST') {
      throw server.preset(400);
    }

    if (id && request.method === 'POST') {
      throw server.preset(400);
    }

    id = id || (await get({model})).length + 1;

    const _id = `${model}/${id}`;
    let doc;
    let data = await request.json();

    try {
      doc = await db.get(_id);
    } catch (err) {
      if (err.status === 404) {
        doc = {
          _id,
          ...data
        }
      } else throw server.preset(err.status);
    }

    try {
      await db.put(doc);
    } catch (err) {
      throw server.preset(err.status);
    }

    return doc;
  }

  if (request.method === 'POST') response.status = 201;
  if (request.method === 'GET') return get(params);
  if (['POST', 'PUT', 'PATCH'].includes(request.method)) return upsert(params);
}

const server = new Server();

describe('Dynamic fixture from database', function() {
  beforeEach(async () => {
    db = new PouchDB('FMF');

    await db.bulkDocs(fixtures);
    server.start()
      .respond
      .with.preset('json')
      .with.body(fetchFixture)
      .with.pattern('/apidb/:model/:id?');
  })

  afterEach(async () => {
    await db.destroy();
    server.stop();
  })

  it('should fetch all rows from a model', async function() {
    let response = await fetch('/apidb/users');
    let data = await response.json();

    data.length.should.equal(2);
  })

  it('should fetch once record from a model', async function() {
    let response = await fetch('/apidb/users/1');
    let data = await response.json();

    data.name.should.equal('foo');
  })

  it('should create a new record', async function() {
    let response = await fetch('/apidb/users', {
      method: 'POST',
      body: JSON.stringify({
        name: 'baz'
      })
    });

    response.status.should.equal(201);
    let data = await response.json();

    data.name.should.equal('baz');
  })
})
