[![Build Status](https://travis-ci.org/liqueurdetoile/fetch-mock-fixtures.svg?branch=master)](https://travis-ci.org/liqueurdetoile/fetch-mock-fixtures)
[![Coverage Status](https://coveralls.io/repos/github/liqueurdetoile/fetch-mock-fixtures/badge.svg?branch=master)](https://coveralls.io/github/liqueurdetoile/fetch-mock-fixtures?branch=master)
[![semantic-release](https://img.shields.io/badge/%20%20%F0%9F%93%A6%F0%9F%9A%80-semantic--release-e10079.svg)](https://github.com/semantic-release/semantic-release)
[![Documentation](https://liqueurdetoile.github.io/fetch-mock-fixtures/badge.svg)](https://liqueurdetoile.github.io/fetch-mock-fixtures/)

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
	- [Configuring fixture response data](#configuring-fixture-response-data)
	- [File location resolution](#file-location-resolution)
		- [Setting up fixtures folder](#setting-up-fixtures-folder)
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
Under the hood, the server is simply sending back a [`Response` object](https://developer.mozilla.org/en-US/docs/Web/API/Response/Response) that mimics a regular fetch call response.

### Configuring server response
Response configuration can be done through a bunch of chainable methods.

**Important: When done on server, configuration persists through each calls and can be changed at runtime without the need to start/stop server. All changes will be applied on the next fetch call.**

#### Setting up returned data
Server can be set to send back some data. Without fixtures, you can use the `respondWith` server method. For additional configuration, see below.

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

At the most simple level, a fixture file only exports a singleton object to override server configuration :
- `body` property for response data
- `headers`, `status`, `statusText` and `wrapper`

Headers can be provided as an `Headers` instance  or as an object with headers names as keys.

If no configuration value is available from fixture, the current server configuration value will be inherited.

You can provide two functions as hooks (see below). In the hooks, the server instance is available as a property.

Finally, to go into fixture mode, you must call the server `respondWithFixture` method before sending request.

Under the hood, the fixture file is used to populate properties from a `Fixture` instance. The `Response` object is generated from fixture properties.

### Fixture lifecycle
When server is dealing with a request, it will :
1. load fixture and create an instance if needed;
2. call and await the `initialized` hook on fixture. Fetching returned data and further configuration can be made at this step;
3. ask fixture to provide its `Response` object build from fixture properties;
4. call and await the `destroyed` hook on fixture. Cleaning can be made at this step;
5. send back the `Response` object

To update fixture properties within hooks, you must **not** use anonymous functions as `this` will point to your test script and not the fixture instance.

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

// Url will be used to locate fixture file
const response = fetch('/api/users/1');
```

### File location resolution
In order to dynamically load the fixture, the server needs to locate the right file based on the url path. FMF allow pure filesystem or a more advanced way with [`path-to-regexp`](https://github.com/pillarjs/path-to-regexp) syntax.

**In both cases, the server expects to find fixtures in a relative `fixtures` folder**

#### Setting up fixtures folder
After transforming the url to a path, FMF will try to load fixture constructor by calling this server method :

```javascript
_getFixtureParams() {
  return require(`fixtures/${this.fixture}.fixture.js`).default
}
```
That implies that :
1. FMF is able to resolve the path
2. Fixture file expose a `default` property (that's why we're using default ES6 exports in the examples)

Therefore, you must ensure that fixture file will be found in the location. In case of error, the server will respond with a `404` error and provide the error description as status text.

With Webpack, it's pretty easy to [create an alias](https://webpack.js.org/configuration/resolve/#resolvealias) to resolve fixtures location. **Nevertheless, to avoid importing tests fixtures in your production bundle, you must use either separate configuration for building and testing or use the webpack [`IgnorePlugin`](https://webpack.js.org/plugins/ignore-plugin/).** You can have a look at the webpack configuration for this current repo for an example.

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
If you're not using webpack, you can also override the `_getFixtureParams` server's method to provide the right finder to load the fixture file.

#### Pure filesystem resolution
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
It's also possible to create a fixture on-the-fly by providing the fixture instance to the `fetch` call. Path resolution will be ignored in that case.

```javascript
import {Server} from 'fetch-mock-fixtures';

const server = new Server();

server.start().respondWithFixture();

// Give the fixture as parameter to fetch
const response = fetch({
	body: 'test'
});
```

## Bugs and improvements
Any bugs and issues can be filed on the [github repository](https://github.com/liqueurdetoile/fetch-mock-fixtures/issues).

You are free and very welcome to fork the project and submit any PR to fix or improve FMF.
