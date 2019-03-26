import {Fixture} from '@';

export default class UsersGet extends Fixture {
  initialized() {
    this.body = {
      id: 1,
      name: 'foo'
    }
  }
}
