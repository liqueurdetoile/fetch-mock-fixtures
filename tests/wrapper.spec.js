import MockServer from '@';

describe('Wrapper option testing suite', function () {
  it('should wrap response with default slot', async function () {
    let server = new MockServer({
      wrapper: '<h1>A good wrapper for %data%</h1>'
    });

    server.start();
    server.respondWith('title');

    let response = await fetch('/');
    let data = await response.text();

    data.should.equal('<h1>A good wrapper for title</h1>');
    server.stop();
  });

  it('should wrap response with named slots', async function () {
    let server = new MockServer({
      wrapper: '<h1>A good wrapper for %title%</h1><h2>And for %subtitle% subtitle</h2>'
    });

    server.start();
    server.respondWith({
      title: 'great jedi',
      subtitle: 'padawan'
    });

    let response = await fetch('/');
    let data = await response.text();
    data.should.equal('<h1>A good wrapper for great jedi</h1><h2>And for padawan subtitle</h2>');
    server.stop();
  });

  it('should wrap response with JSON data', async function () {
    let server = new MockServer({
      wrapper: `{
        "success":true,
        "data":%data%
      }`
    });

    server.start();
    server.respondWithJSON({test: 'ok'});

    let response = await fetch('/');
    let data = await response.json();
    data.success.should.be.true;
    data.data.test.should.equal('ok');
    server.stop();
  });

  it('should use a callback function as wrapper', async function() {
    let server = new MockServer();

    server.wrapper = data => JSON.stringify({success:true, data})

    server.start();
    server.respondWith({test: 'ok'});

    let response = await fetch('/');
    let data = await response.json();
    data.success.should.be.true;
    data.data.test.should.equal('ok');
    server.stop();
  })
});
