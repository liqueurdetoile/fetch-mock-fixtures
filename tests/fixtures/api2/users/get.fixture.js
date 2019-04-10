const users = [
  {
    id: 1,
    name: 'foo'
  },
  {
    id: 2,
    name: 'bar'
  }
];

export default {
  body: async function({id}, {server}) {
    if (id) {
      let user = users.find(user => user.id === Number(id));

      if (user) return user;
      throw server.preset(404);
    }

    return users;
  }
}
