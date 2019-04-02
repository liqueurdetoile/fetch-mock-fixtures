import Server from '@';

const server = new Server();

server.getFixtureParams = function() {
  return require(`fixtures/${this.fixture}.fixture.js`).default;
}

export default server;
