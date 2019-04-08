import PouchDB from 'pouchdb';

export default {
  body: async function(params) {
    const db = new PouchDB('test');
    const {id} = params;

    if (id) {
      try {
        let doc = await db.get(id);

        delete doc._id;
        delete doc._rev;
        return doc;
      } catch (err) {
        throw {
          headers: {'content-type': 'text/html'},
          status: err.status,
          statustext: err.name,
          body: err.message
        };
      }
    }

    let docs = await db.allDocs({
      include_docs: true
    });

    return docs.rows.map(row => {
      delete row.doc._id;
      delete row.doc._rev;

      return row.doc
    });
  }
}
