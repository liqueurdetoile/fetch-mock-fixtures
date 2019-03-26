import {Fixture} from '@';

export default class UsersGet extends Fixture {
  initialized() {
    this.body = [
      {
        id: 1,
        name: 'foo'
      },
      {
        id: 2,
        name: 'bar'
      }
    ];
  }
}
