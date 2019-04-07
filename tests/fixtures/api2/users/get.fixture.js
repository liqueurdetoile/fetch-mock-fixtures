import PouchDB from 'pouchdb';

export default {
  body: async function(params) {
    const db = new PouchDB('test');
    const {id} = params;

    if (id) {
      let doc = await db.get(id);

      delete doc._id;
      delete doc._rev;
      return doc;
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
