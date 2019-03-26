import PouchDB from 'pouchdb';

export default {
  initialized: async function({id}) {
    const db = new PouchDB('test');

    try {
      this.body = await db.get(id);
      this.wrapper = data => JSON.stringify(data);
      this.headers = (new Headers()).set('content-type', 'application/json');

    } catch (err) {
      this.status = 404;
    }
  }
}
