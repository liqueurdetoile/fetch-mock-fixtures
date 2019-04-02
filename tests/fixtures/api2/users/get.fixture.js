import PouchDB from 'pouchdb';

export default {
  initialized: async function({id}) {
    const db = new PouchDB('test');

    try {
      this.body = id ? await db.get(id) : await db.allDocs({
        include_docs: true
      }).rows.map(row => row.doc);
      this.wrapper = body => JSON.stringify(body);
      this.headers = new Headers({'content-type': 'application/json'});      
    } catch (err) {
      this.status = 404;
    }
  }
}
