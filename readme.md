<p align="center"><a href="https://liqueurdetoile.com" target="\_blank"><img src="https://hosting.liqueurdetoile.com/logo_lqdt.png" alt="Liqueur de Toile"></a></p>

# Fetch-mock-fixtures (FMF)

FMF provides an easy way to mock fetch calls through Sinon stub. Unlike other modules
that also provides this functionality, FMF provides an easy way to manage data fixtures.

Fixtures can be generated on the fly, stored as a file tree or grabbed in an external data source.

**FMF is internally relying on Promise and the fetch API and linked objects (Request, Headers and Response). Be sure to use that the browser(s) used for testing implements these or is/are polyfilled.**

<!-- TOC depthFrom:2 depthTo:6 withLinks:1 updateOnSave:1 orderedList:0 -->

- [Installation](#installation)
- [Usage and configuration for mocking fetch calls](#usage-and-configuration-for-mocking-fetch-calls)
	- [Most basic example](#most-basic-example)
	- [Configuring server response](#configuring-server-response)
		- [Setting up returned data](#setting-up-returned-data)
		- [Response object configuration](#response-object-configuration)
		- [Using response wrappers](#using-response-wrappers)
- [Fixtures system](#fixtures-system)
	- [Basics](#basics)
	- [Fixture lifecycle](#fixture-lifecycle)
	- [Configuring fixture response](#configuring-fixture-response)
	- [File location resolution](#file-location-resolution)
		- [Setting up fixtures root](#setting-up-fixtures-root)
		- [Pure filesystem resolution](#pure-filesystem-resolution)
		- [Pattern resolution](#pattern-resolution)
	- [Fixture on-the-fly](#fixture-on-the-fly)
- [Bugs and improvements](#bugs-and-improvements)

<!-- /TOC -->

## Installation
Installation can easily be done through NPM or yarn :
```bash
npm install fetch-mock-fixtures --save-dev

yarn add fetch-mock-fixtures --dev
```
FMF aims to ease API testing, therefore it should be included as a dev dependency in projects.

## Usage and configuration for mocking fetch calls
### Most basic example
```javascript
// Create a server
import {Server} from 'fetch-mock-fixtures';

// Create the server instance
server = new Server();

// Start intercepting fetch calls
server.start();

// Set up the server response (no matter the url)
server.respondWith('Hello world !');

// Do fetch call
fetch('/').then(response => {
  response.text().then(message => {
    console.log(message); // outputs 'Hello world !'
  });
})

// Stop intercepting fetch calls
server.stop();
```
Under the hood, server is simply sending back a [`Response` object](https://developer.mozilla.org/en-US/docs/Web/API/Response/Response) that mimics a regular fetch call return value.

### Configuring server response
Response configuration can be done through a bunch of chainable methods.

**Important: Configuration persists through each calls and can be changed at any time without the need to start/stop server. All changes will be applied on the next fetch call.**

#### Setting up returned data
FMF can be set on the fly to send back some data. Without fixtures, you can use the `respondWith` server method. For additional configuration, see below.

The server instance also exposes two shortcuts :
- `respondWithStatus` : This will send back the provided data with the given status,
- `respondWithJSON` : this will apply `JSON.stringify` to the provided data and set content-type response headers to `application/json`.

#### Response object configuration

Here's the available response configuration options :

  Configuration key | Chainable setter  | Description  |  Default
--|---|---|---
`delay`  | `setDelay`  |  Set a delay (in ms) before sending back response. It can be useful when testing timeout management  | `0`
`headers`  | `setHeaders`  | Define the response headers. It accepts an object with header names as keys or an [Headers](https://developer.mozilla.org/en-US/docs/Web/API/Headers) instance  |  Default header is `content-type: text/html`
`status` | `setStatus` | Define the response status code | `200`
`statusText`  | `setStatusText`  | Define the response status text  |  `'OK'`

FMF also accepts two other options that will be discussed below : `pattern` and `wrapper`.

```javascript
// Create a server
import {Server} from 'fetch-mock-fixtures';

// Create the server instance and start it
server = new Server();
server.start();

// Set headers status to 201 and content-type to application/json
server
  .configure({
    status: 201,
    headers: {'content-type': 'application/json'}
  })
  .respondWith(JSON.stringify({test: 'ok'}));

// or
server
  .setHeaders({
    'content-type': 'application/json'
  })
  .setStatus(201)
  .respondWith(JSON.stringify({test: 'ok'}));

// or shorter
server
  .setStatus(201)
  .respondWithJSON({test: 'ok'});

// Reset configuration to default
server.reset();
```
#### Using response wrappers
The server instance allow the configuration of a wrapper that will be applied on data. The behavior of the wrapper depends on wrapper and data types :

wrapper type  | data type  |  behavior
--|---|--
 string | string  | The server will look for a `%data%` template in the wrapper and replace it with the data
  string | object  | For each data key, the server will try to find a `%<key>%` template in the wrapper string and replace it with data value
  function | anything  |  The server will use the returned value of the callback. Data is passed as argument of the callback

You may have a look at the wrapper test suite for some examples.

## Fixtures system
### Basics
The fixture is a simple way to automatically configure a given response when matching a given "url". FMF provides a `Fixture` class as a convenient way to do it.

A `Fixture` instance expects the server instance as constructor argument and it will be kept available as `server` fixture property. Unlike direct server configuration, a fixture have its own response configuration that are not persisted through fetch calls.

Nevertheless, for convenience, server configuration is cloned into fixture configuration when created.

To go into fixture mode, you must call the server `respondWithFixture` method before sending request.

### Fixture lifecycle
When server is dealing with a request, it will :
1. load fixture and create an instance if needed;
2. call and await the `initialized` hook on fixture. Returned data and further configuration can be made at this step;
3. ask fixture to provide its `Response` object;
4. call and await the `destroyed` hook on fixture. Cleaning can be made at this step;
5. send back the `Response` object

### Configuring fixture response
The best way is to set fixture properties in the `initialized` hook. The inheritance between server and fixture can ease the process. A `Fixture` instance exposes `body`, `headers`, `status`, `statusText` and `wrapper` properties. They will be used to build the `Response` object at step 3.

```javascript
// Fixture class
import {Fixture} from 'fetch-mock-fixtures';

export default class UserGet1 extends Fixture {
  initialized() {
    this.body = {
      id: 1,
      name: 'foo'
    }
  }
}
```

```javascript
// Test code
import {Server} from 'fetch-mock-fixtures';

const server = new Server();

server
  // The header will default in any fixtures
  .setHeaders({'content-type':'application/json'})
  // All fixture body will be transformed with JSON.stringify
  .wrapper(data => JSON.stringify(data))
  // Activate fixture mode
  .respondWithFixture()

// Url will be used to locate fixture file
const response = fetch('/api/users/1');
```

### File location resolution
In order to dynamically load the fixture, the server needs to locate the right file based on the url path. FMF allow pure filesystem or a more advanced way with [`path-to-regexp`](https://github.com/pillarjs/path-to-regexp) syntax.

**In both cases, the server expects to find fixtures in a relative `fixtures` folder**

#### Setting up fixtures root
After transforming the url to a path, FMF will try to load fixture constructor by calling this server method :

```javascript
_getFixtureConstructor() {
  return require(`fixtures/${this.fixture}.fixture.js`).default
}
```
Therefore, you must ensure that fixture factory will be found in this location. In case of error, the server will respond with a `404` error and provide the error description as status text.

With webpack, it is pretty easy to [create an alias](https://webpack.js.org/configuration/resolve/#resolvealias) to resolve fixtures location.

For instance, if you fixtures are located under `tests/fixtures` within your project root folder, you can use this code in your webpack configuration :

```javascript
module.exports = {
  // [...]
  resolve: {
    alias: {
      'fixtures': path.resolve('./tests/fixtures')
    }
  }
  // [...]
};
```
If you're not using webpack, you can simply override the `_getFixtureConstructor` server's method to provide the right finder for the fixture constructor.

#### Pure filesystem resolution
When not using pattern to analyze url, the server simply split the path and will look for a file named from the method used. For instance, `/api/v1/users/1` with GET method will resolve in `fixtures/api/v1/users1/1/get.fixture.js` and `/users` with POST method will resolve in `fixtures/users/post.fixture.js`.

This is most appropriate when you want a small set of samples for your testing purposes.

#### Pattern resolution
If you have a larger set of data or want to rely on external data source, you may want to use pattern resolution to extract params from url path.

FMF uses the pattern available with [`path-to-regexp`](https://github.com/pillarjs/path-to-regexp). The resulting file path will be the one without params and the params will be passed in arguments to the initialized hook :

```javascript
// Fixture class
// We want to aggregate two requests to have the full users
import {Fixture} from 'fetch-mock-fixtures';

export default class UserGet1 extends Fixture {
  // We are using spread operator here to fetch back param
  initialized({id}) {
    return new Promise((resolve, reject) => {
      // Restoring fetch to do outside call
      this.server.stop();

      let p1 = fetch(`http://api.example.com/users/${id}`);
      let p2 = fetch(`http://api2.example.com/users/${id}`);

      // Restoring server
      this.server.start();

      Promise.all([p1, p2]).then([r1, r2] => {
        this.body = Object.assign({}, r1, r2);
				resolve();
      })
    });
  }
}
```
```javascript
// Test code
import {Server} from 'fetch-mock-fixtures';

const server = new Server();

server
  // The header will default in any fixtures
  .setHeaders({'content-type':'application/json'})
  // All fixture body will be transformed with JSON.stringify
  .setWrapper(data => JSON.stringify(data))
	// Set pattern
	.setFixturePattern('/api/users/:id')
  // Activate fixture mode
  .respondWithFixture()

// Url will be used to locate fixture file
const response = fetch('/api/users/56');
```

The initialized hook is always called async, even if declared only as sync operations. Therefore, you can simply return a promise or use the `async/await` statements.

In the fixtures test suite, you will find a similar example with PouchDB. This can be very useful to generate bunches of data server side and import it client side for testing purposes.

### Fixture on-the-fly
It's also possible to create a fixture on-the-fly and demands server to send it back by providing the fixture instance to the `fetch` call. Path resolution will be ignored in that case.

```javascript
import {Fixture, Server} from 'fetch-mock-fixtures';

const server = new Server();
const fixture = new Fixture(server);

fixture.initialized = () => {
  // Set up the body
  fixture.body = 'test';
}

fixture.destroyed = () => {
  // Do some cleaning here
}

server.respondWithFixture();

// Give the fixture as parameter to fetch
const response = fetch(fixture);
```

## Bugs and improvements
Any bugs and issues can be filed on the [github repository](https://github.com/liqueurdetoile/fetch-mock-fixtures/issues).

You are free and very welcome to fork the project and submit any PR to fix or improve FMF.
