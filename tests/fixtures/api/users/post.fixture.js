import {Fixture} from '@';

export default class UsersPost extends Fixture {
  initialized() {
    this.status = 201;
    this.body = {
      id: 3,
      name: 'baz'
    };
  }
}
