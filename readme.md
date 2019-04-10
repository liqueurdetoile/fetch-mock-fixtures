[![Build Status](https://travis-ci.org/liqueurdetoile/fetch-mock-fixtures.svg?branch=master)](https://travis-ci.org/liqueurdetoile/fetch-mock-fixtures)
[![Coverage Status](https://coveralls.io/repos/github/liqueurdetoile/fetch-mock-fixtures/badge.svg?branch=master)](https://coveralls.io/github/liqueurdetoile/fetch-mock-fixtures?branch=master)
[![semantic-release](https://img.shields.io/badge/%20%20%F0%9F%93%A6%F0%9F%9A%80-semantic--release-e10079.svg)](https://github.com/semantic-release/semantic-release)
[![Documentation](https://liqueurdetoile.github.io/fetch-mock-fixtures/badge.svg)](https://liqueurdetoile.github.io/fetch-mock-fixtures/) [![Greenkeeper badge](https://badges.greenkeeper.io/liqueurdetoile/fetch-mock-fixtures.svg)](https://greenkeeper.io/)

<p align="center"><a href="https://liqueurdetoile.com" target="\_blank"><img src="https://hosting.liqueurdetoile.com/logo_lqdt.png" alt="Liqueur de Toile"></a></p>

# Fetch-mock-fixtures (FMF)

Since v2, FMF is meant to :
- offers a BDD style syntax to configure responses in more readable-friendly way
- provide an easy way to configure response on-the-fly
- provide a powerful responses preset and fixtures system to avoid writing the same things again and again and ease functional tests

While most of mockers for fetch are only meant to intercept and define the next response content, FMF goes far beyond and offers a wide range of tools.

FMF will give its best with any testing framework (Mocha, Jasmine, Junit...) that allows to automate operations between each tests.

## Installation

Installation can easily be done through NPM or Yarn. Sinon is required by FMF to stub `fetch` but is not included in the bundle. It must be installed as well if not already present.

```bash
npm install sinon fetch-mock-fixtures --save-dev

yarn add sinon fetch-mock-fixtures --dev
```
FMF should be installed as a dev dependency. It is not meant to be used as an in-app offline mode feature.

**Note** : FMF is built upon Promise, Proxy and fetch API (Request, Headers, Response) that are available in all modern browsers. If you intend to run tests on older browsers (IE) or versions, you may need to polyfill them. Here's some available tools you can use :
- Promise: [ES6-Promise](https://www.npmjs.com/package/es6-promise)
- Fetch API : [window.fetch polyfill](https://www.npmjs.com/package/whatwg-fetch)
- Proxy: [proxy-polyfill](https://www.npmjs.com/package/proxy-polyfill)



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
Under the hood, the server is simply sending back a [`Response` object](https://developer.mozilla.org/en-US/docs/Web/API/Response/Response) that mimics a regular fetch call response.

### Controlling server
An FMF server instance exposes a few methods/properties to control server state.

Method  |  Description
--|--
`start()` |  Start the server by stubbing `window.fetch`
`reset(stub=false)`  |  Reset to the server default configuration (see below). If `stub` is true, the sinon stub will also be resetted at the same time.
`stop()`  |  Stop the server by restoring `window.fetch`. That does not affect server actual configuration.
`running`  |  Returns true if server is running
`stub`  |  Direct access to the stub of `window.fetch`. Accessing the property when server is not started will raise an Error.

window.fetch is a fully functional [Sinon stub](https://sinonjs.org/releases/latest/stubs/). Therefore, you can use any of the method available on a stub.

### Accessing request(s) sent to server
The server keeps all requests sent since the last start/stub reset. To ease, outgoing API requests tests, an FMF sever instance exposes a bunch of properties/method to access requests :

Property/Method  |  Description
--|--
`request`  |  Returns the last request made as a [Request object](https://developer.mozilla.org/en-US/docs/Web/API/Request)
`url`  |  Returns the last url called as a parsed object (see [url-parse](https://www.npmjs.com/package/url-parse))
`query`  |  Returns the parsed query part of the last called url (see [url-parse](https://www.npmjs.com/package/url-parse))
`callCount`  |  Returns the number of requests received
`getRequest(n)`  |  Returns the request send on the (n + 1)<sup>th</sup> call as a [Request object](https://developer.mozilla.org/en-US/docs/Web/API/Request). For instance, `server.getRequest(0)` will return the first request made
`getAllRequests()`  |  Returns an array of all requests made as [Request objects](https://developer.mozilla.org/en-US/docs/Web/API/Request) in the same order than the calls
`requestToUrl(request)`  |  Expects a [Request object](https://developer.mozilla.org/en-US/docs/Web/API/Request) as argument and returns a parsed url (see [url-parse](https://www.npmjs.com/package/url-parse))

### Setting up Response
If you only need to disable `window.fetch`, you can simply start the server. All calls will be answered with the same default response configuration (see below).

For testing purposes, you may want to go deeper. FMF have three ways of dealing with incoming requests :

1. Sending a response based on the current configuration

2. Sending a response that can vary on a call count (it can be pretty handy when dealing with functional tests that may performs several calls)

3. Using fixtures (see below). Fixtures can be combined with ordered responses

### A more advanced example with Mocha
In real world, you may use some frameworks for your tests. Here's a full real-like example with FMF and Mocha :
```javascript
import {Server} from 'fetch-mock-fixtures';
// The api you're testing
import api from 'modules/api';

describe('API test suite', function() {
	const server = new Server();

	before(() => server.start()) // start the server at the beginning
	afterEach(() => server.reset(true)) // Fully reset server between each tests
	after(() => server.stop()) // Stop the server at the end

	describe('Unit test API', function() {
		it('should GET data', async function() {
			server.respondWithJSON({
				id: 1,
				name: 'foo'
			})

			const data = await api.get('/api/v1/users/1');
			data.should.deep.equal({
				id: 1,
				name: 'foo'
			});

			server.respondWithJSON({ // Changing server configuration between calls
				id: 2,
				name: 'baz'
			})

			const data = await api.get('/api/v1/users/2');
			data.should.deep.equal({
				id: 2,
				name: 'baz'
			});
		})
	})

	// Others unit tests

	describe('Functional tests API', function() {
		// Okay, we have a two steps auth. First username, then password
		it('should log in user', async function() {
			server
				.onFirstCall()
				.setStatus(401)
				.respondWithJSON({
					success: true
				})
				.onSecondCall()
				.setStatus(200) // Can be skipped as it is the default server status
				.respondWithJSON({
					success: true,
					token: '123'
				})

			let logged = api.login({id: 1}); // will do the two requests
			logged.should.be.true;			
			api.token.should.equal('123');

			// You can also check requests
			const q1 = server.requestToUrl(server.getRequest(0)).query; // query part of the first request
			const r2 = server.request; // Last request

			q1.username.should.equal('foo');
			// [...]
		})
	})

	// Others functional tests
})
```

### Response configuration

#### Data

**Important: configuration persists through each calls and can be changed at runtime without the need to start/stop server. All changes will be applied on the next fetch call.**

Server can be set to send back data. Without fixtures, you can use the `respondWith(body, init)` server method. For additional configuration, see below.

The server instance also exposes two shortcuts :
- `respondWithStatus(status, body)` : This will send back the optionally provided body with the given status,
- `respondWithJSON(body, init)` : this will apply `JSON.stringify` to the provided data and set content-type response headers to `application/json`.

**Body can also be provided as a callback that will be evaluated synchronously at runtime. The server instance is passed as argument.**

#### Response init parameters

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

### Using response wrappers
The server instance allow the configuration of a wrapper that will be applied on data. The behavior of the wrapper depends on wrapper and data types :

wrapper type  | data type  |  behavior
--|---|--
 string | string  | The server will look for a `%data%` template in the wrapper and replace it with the data
  string | object  | For each data key, the server will try to find a `%<key>%` template in the wrapper string and replace it with data value
  function | anything  |  The server will use the returned value of the callback. Data is passed as argument of the callback

You may have a look at the wrapper test suite for some examples.

## Fixtures system
### Basics
The fixture is a simple way to automatically configure a Response object when matching a given "url". FMF provides a `Fixture` class as a convenient way to do it while adding a callback before and after building the response object. Usually, you do not need to create the fixture instance but provides parameters as an object :

Parameter name  |  Type | Description
:--:|:--:|--
delay  |  `Number` | Number of ms to wait before sending the response
body  |  `null, Number, String, Function` | Body to send back with response. If provided as a function, the body will be evaluated **synchronously**
headers |  `Object, Headers` | Headers can be provided as an `Headers` instance  or as an object with headers names as keys
status |  `Number` | Response status code
statusText | `String` | Response status text
wrapper | `String, Function` | See [Using response wrappers](#using-response-wrappers)
initialized  |  `Function` | Callback called **asynchronously** before building response
destroyed  |  `Function` | Callback called **asynchronously** after building response

**If no configuration value for a given parameter is available from fixture, the current server configuration value will be inherited.**

You can provide two functions as hooks (see below). In the hooks, the `server` instance is available as a property from `this`.

Finally, to go into fixture mode, you must call the server `respondWithFixture` method **before** sending the request or accordingly to the call order.

Under the hood, the fixture is used to populate properties from a `Fixture` instance. The `Response` object is then configured from fixture properties.

### Fixture lifecycle
When server is dealing with a request, it will :
1. load fixture and create an instance if needed;
2. call and await the `initialized` hook on fixture. Fetching returned data and further configuration can be made at this step;
3. ask fixture to provide its `Response` object build from fixture properties. Dynamic synced response can be configured in a body as a callback;
4. call and await the `destroyed` hook on fixture. Cleaning can be made at this step;
5. send back the `Response` object

To update fixture properties or access server property within hooks, you must **not** use anonymous functions as `this` will point to your test script and not the fixture instance.

### Configuring fixture response data
For static data, providing a value to body is enough. For dynamic data, you can use the `initialized` hook which is called async.

The inheritance between server and fixture can ease the process.

```javascript
// Fixture file
export default {
	body: {
    id: 1,
    name: 'foo'
  }
}
```

```javascript
// Within test
import {Server} from 'fetch-mock-fixtures';

const server = new Server();

server
  // The header will default in any fixtures
  .setHeaders({'content-type':'application/json'})
  // All fixture body will be transformed with JSON.stringify
  .wrapper(data => JSON.stringify(data))
  // Activate fixture mode
  .respondWithFixture()

// Url will be used to locate fixture
const response = fetch('/api/users/1');
```

### Setting up fixtures resolution
In order to let FMF loads the fixture, the server expects to have a `getFixtureParams` method (`_getFixtureParams` prior to 1.1.0) to resolve url into fixture params.

From 1.0.2, FMF will respond with a `500` error if the loader is not set.

In case of error, the server will respond with a `404` error and provide the error description as status text.

### Using webpack and fixtures as files
With Webpack, it's pretty easy to [create an alias](https://webpack.js.org/configuration/resolve/#resolvealias) to resolve fixtures location and require them at runtime. **Nevertheless, to avoid importing tests fixtures in your production bundle, you must use either separate configuration for building and testing or use the webpack [`IgnorePlugin`](https://webpack.js.org/plugins/ignore-plugin/).** You can have a look at the webpack configuration for this current repo for an example.

For instance, if you fixtures are located under `tests/fixtures` within your project root folder, you can use this code in your webpack tests configuration :

```javascript
const path = require('path');

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

```javascript
// Then in test
import {Server} from 'fetch-mock-fixtures';

const server = new Server();

server.getFixtureParams = function () {
  return require(`fixtures/${this.fixture}.fixture.js`).default
}
```

You can affect any logic the `getFixtureParams` server's method to provide any finder to load the fixture file.

#### Pure path resolution
When not using pattern to analyze url, the server simply split the path and will look for a file named from the method used with `.fixture.js` as extension.

For instance, `/api/v1/users/1` with GET method will resolve in `fixtures/api/v1/users/1/get.fixture.js` and `/users` with POST method will resolve in `fixtures/users/post.fixture.js`.

This is most appropriate when you want a small set of samples for your testing purposes.

#### Pattern resolution
If you have a larger set of data or want to rely on external data source, you may want to use pattern resolution to extract params from url path.

FMF uses the pattern available with [`path-to-regexp`](https://github.com/pillarjs/path-to-regexp). The resulting file path will be the one without params and the params will be passed in arguments to the initialized hook.

For instance, `/api/v1/users/:id` as pattern and `api/v1/users/1`with GET method in fetch call will resolve in `fixtures/api/v1/users/get.fixture.js` as file and will provide an `{id: 1}` as param to the `initialzed` hook.

```javascript
// Fixture file

// Located at /fixtures/api/users/get.fixture.js
// We want to aggregate two requests to have the full users

export default {
	// Do not use anonymous function here as we're using' this
	initialized: function({id}) {
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
  .setHeaders({'content-type':'application/json'})
  .setWrapper(data => JSON.stringify(data))
	// Set pattern
	.setFixturePattern('/api/users/:id')
  .respondWithFixture()

// Url will be used to locate fixture file
const response = fetch('/api/users/56');
```

The initialized hook is always called asynchronously, even if declared only as sync operations. Therefore, you can simply return a promise or use the `async/await` statements.

In the fixtures test suite, you will find a similar example with PouchDB.

This way is more appropriate when generating bunches of data server side and import it client side for testing purposes.

### Fixture on-the-fly
It's also possible to create a fixture on-the-fly by providing the fixture params to the `fetch` call. Path resolution will be ignored in that case.

```javascript
import {Server} from 'fetch-mock-fixtures';

const server = new Server();

server.start().respondWithFixture();

// Give the fixture as parameter to fetch
const response = fetch({
	body: 'test'
});
```

## Setting up multiple responses based on call count
For functional testing, it may be useful to configure multiple responses at once as there will be multiple requests made without ability to tweak server's response between them.

This can be easily done with `onCall` method and the shortcuts `onFirstCall` (i.e. `onCall(0)`), `onSecondCall` (i.e. `onCall(1)`) and `onThirdCall` (i.e. `onCall(2)`).

Without `onCall`, the server will use its current response configuration if `respondWith` have been used or fixture if `respondWithFixture` have been used. This also apply when request doesn't match a predefined count.

For instance, let's say we want to simulate a timeout management.

First request response must be delayed by 5s then a 504 error, second one must be immediate still with a 504 error and next ones from a fixture.

```javascript
import {Server} from 'fetch-mock-fixtures';

const server = new Server();

server
	.start()

	.onFirstCall() // Tells server to freeze response configuration at next respondWithXXX call and keep it for first response
	.setDelay(5000)
	.respondWithStatus(504) // Freeze the configuration at this step

	.onSecondCall() // Tells server to freeze response configuration at next respondWithXXX call and keep it for second response
	.setDelay(0) // Set back delay to 0
	.respondWithStatus(504) // Freeze the actual configuration for the second request

	.respondWithFixture(); // Default response for third and next requests
```

**The default configuration must be provided at the very end of the chain.**

## Bugs and improvements
Any bugs and issues can be filed on the [github repository](https://github.com/liqueurdetoile/fetch-mock-fixtures/issues).

You are free and very welcome to fork the project and submit any PR to fix or improve FMF.

## Changelog
- 1.0.1 : Add requests history and possibility to set up different responses based on requests order. Add delay as a response parameter into fixture.
