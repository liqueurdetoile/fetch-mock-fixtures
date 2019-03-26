import {Fixture} from '@';
import PouchDB from 'pouchdb';

export default class UsersGet extends Fixture {
  async initialized({id}) {
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
