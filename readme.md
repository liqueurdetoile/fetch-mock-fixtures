![Build status](https://github.com/liqueurdetoile/fetch-mock-fixtures/actions/workflows/test-suite.yml/badge.svg?branch=master)
[![Coverage Status](https://coveralls.io/repos/github/liqueurdetoile/fetch-mock-fixtures/badge.svg?branch=master)](https://coveralls.io/github/liqueurdetoile/fetch-mock-fixtures?branch=master)
[![Documentation](https://liqueurdetoile.github.io/fetch-mock-fixtures/badge.svg)](https://liqueurdetoile.github.io/fetch-mock-fixtures/)
[![Known Vulnerabilities](https://snyk.io/test/github/liqueurdetoile/fetch-mock-fixtures/badge.svg)](https://snyk.io/test/github/liqueurdetoile/fetch-mock-fixtures)
[![PRs Welcome](https://img.shields.io/badge/PRs-welcome-brightgreen.svg?style=flat-square)](http://makeapullrequest.com)

<p align="center"><a href="https://liqueurdetoile.com" target="\_blank"><img src="https://hosting.liqueurdetoile.com/logo_lqdt.png" alt="Liqueur de Toile"></a></p>

# Fetch-mock-fixtures (FMF)
While most of mockers for fetch are only meant to intercept and define the next response content, FMF goes far beyond and offers a wide range of tools for testing js apps.

What is featured :
- BDD style syntax to configure server and fixtures in a more readable-friendly way. It's heavily inspired by [Chai `should` assertion library](https://www.chaijs.com/guide/styles/#should),
- Easy way to configure response on-the-fly, mutating responses from call to call...
- Enhanced [`Request`](https://developer.mozilla.org/en-US/docs/Web/API/Request) native object to automatically parse url details and query content with [`url-parse`](https://github.com/unshiftio/url-parse#readme),
- Powerful response presets and fixtures system to avoid writing the same things again and again and ease functional testing,
- Easy access to the full history or requests/responses handled by the server since its first start or last reset,
- Parametrized request thanks to [`path-to-regexp`](https://github.com/pillarjs/path-to-regexp#readme) to enable dynamic fixtures routing in a few lines of code
- and many more !

For instance, with FMF, you can do such things to quickly configure two fixtures in a mocha test (that will obviously succeed) :

```javascript
import Server from 'fetch-mock-fixtures';

const server = new Server();

describe('Headers test', function() {
  before(() => server.start()) // Start intercepting fetch calls
  after(() => server.stop()) // Restore to normal behavior

  it('should use json headers', async function() {
    server
      .when // or .on
        .header('content-type').equal(/json/) // use a regexp here to avoid writing full header
        .respond.with.preset('200')
      .fallback.to.preset('400')

    let response = await fetch('/', {
      headers: {'content-type': 'application/json'}
    });

    response.status.should.equal(200);
  })
})
```
**How FMF can ease API outgoing requests unit tests ?**

FMF enables really quick response configuration that allows testing the outgoing request to set up different responses (see above example). You only have to check a response property (like status) instead of manually parsing request built by your app to validate it.

Furthermore, you can use the `before` and `after` hooks or `body` as a callback to alter response on very precise expectations.

**How FMF can ease functional tests ?**

In real life, scripts are often sending multiple requests to do their job. FMF removes the pain of handling multiple responses by easing their management. Let's see this example with a two steps authentication login. A bit verbose for what is actually doing but it aims to illustrate things :

```javascript
import Server from 'fetch-mock-fixtures';

const server = new Server();

// Define on-the-fly fixtures to handle login tests
server
  .verbose(true) // Enable console login for each request/response/error
  .when
      .pathname.equal('/login')
      .method.equal('POST')
      .body('json').equal(body => body.username === 'foo')
    .respond.with
      .preset(401)
  .when
      .pathname.equal('/session')
      .method.equal('POST')
      .body('json').equal(token => body.authToken === '123')
    .respond.with
      .preset('json')
      .body({success: true, sessionToken: '456'})
  .fallback.to
    .preset(403)

describe('Login test suite', function() {
  before(() => server.start())
  after(() => server.stop())

  it('should login', async function() {
    await triggerTheLoginLogic('foo');
    await sendTheTokenLogic('123');
    logged.should.be.true;
  })

  it('should fail login on username', async function() {
    await triggerTheLoginLogic('bar');
    logged.should.be.false;
  })

  it('should fail login on token', async function() {
    await triggerTheLoginLogic('foo');
    await sendTheTokenLogic('hacked!');
    logged.should.be.false;
  })
})
```
We're not only sending back data to the app but also checking outgoing requests at the same time because the answer will only be sent if calling the right url with the right method and the right data. `with` and `to` are only optional sugars to improve human readability.

Last not least, you can easily deploy url-based routing to use your "real" data inside each tests instead of providing fake data and get rid of on-the-fly fixtures (see [dynamic fixtures examples](https://liqueurdetoile.github.io/fetch-mock-fixtures/manual/dynamic-fixtures-examples)).

**When to use FMF ?**

At any time :smile:

Nevertheless, FMF will truly give its best with any testing framework (Mocha, Jasmine, Junit...) that allows to automate operations between each tests like `start`, `stop` or `reset` the server.

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

## Full documentation and API reference
Please pay visit to [the docs pages](https://liqueurdetoile.github.io/fetch-mock-fixtures/).

## Bugs and improvements
Any bugs and issues can be filed on the [github repository](https://github.com/liqueurdetoile/fetch-mock-fixtures/issues).

You are free and very welcome to fork the project and submit any PR to fix or improve FMF.

I'm especially interested for good will who wish to improve query matcher processors to provide more tools to evaluate query and choose the right response.

## Changelog
- 2.2.0 : Add global preset configuration within server instance and throw behavior for fixture
- 2.1.0 : Add history logging and verbose mode
- 2.0.0 : BREAKING CHANGE - A brand new FMF highly **not** compatible with previous version
- 1.0.1 : Add requests history and possibility to set up different responses based on requests order. Add delay as a response parameter into fixture.
