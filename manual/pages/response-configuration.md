# Response configuration
Fixtures and presets share the same response configurator. It allows to set up response content and/or adapt request processing behavior.

## Configure response
From the fixture or the preset, you can either use the `set` method and/or use the BDD style :
```javascript
const server = new Server()

server.respond // will register a new Fixture
  .set({
    status: 200
  })
  .headers({'content-type': 'application/json'})
  .body(body => JSON.stringify({message: 'Hellow world !'}));

// Server will now respond to all requests with a JSON response and status 200
```
The response properties name are the same between object set approach and BDD style.
The last assignment (no matter the way you're doing it) will override the previous. You can remove an option by providing false as value :

```javascript
const server = new Server()

server.respond // will register a single fixture
  .body(body => JSON.stringify({message: 'Hello world !'}));

// Remove body callback
server.respond // will fetch the fixture
  .body(false);
```

### Default response values
There's no default value for a fixture/preset response. You can use set up a preset and use it to automatically populate one
or more response options of a fixture.

### Response configuration persistence
Fixtures are stored within server and persists until server is reset. If you share the same server between many tests, any changes to fixtures
configuration will persist into next tests. This can sometimes be tricky if you're updating an option of the fallback fixture in one test. See [fixtures](fixtures.html) for more informations. This can also be really useful as you can create fixtures only once and share them along all tests.

## Available response options
Each response option can be removed by affecting the false value to it. ** It is evaluated as a strict comparison.**

FMF doesn't provide any default values, but Response implementation usually set up a status 200 with 'text/html' encoding to a new Response object when no options is provided.

Option  | Allowed value(s)  |  Description
--|---|--
body  |  null &verbar; Blob &verbar; BufferSource &verbar; FormData &verbar; ReadableStream &verbar; URLSearchParams &verbar; USVString &verbar; Function  | You can use any of the available types for a native [Response](https://developer.mozilla.org/fr/docs/Web/API/Response/Response) object. FMF also accepts a callback that will return the body content or alter the response (see [fixture lifecycle](fixtures.html#fixture-lifecycle))
delay  | Number  | The fixture response will be delayed by X ms
headers  | Object &verbar; [Headers](https://developer.mozilla.org/en-US/docs/Web/API/Headers)  |  The object will be used to instantiate the Headers
status  | Number |  Status code of the response (2XX - 5XX). Some status code may have some requirements. For instance, trying to set up a body with a 204 status code will fail. It is not a FMF behavior but from native Response object.
statusText  |  String | Status text along the status code
wrapper  | Function | Wrapper callback that transforms body. See [wrappers](#using_wrappers)
preset  |  String | **Only available within a fixture**. See [presets](presets.html)
pattern  | String | Pattern to apply to extract parameters from incoming request url. See [patterns](#using_pattern)
before  | Function  |  Callback called before the response is built. See [fixture lifecycle](fixtures.html#fixture-lifecycle)
after  |  Function |  Callback called after the response have been built.  See [fixture lifecycle](fixtures.html#fixture-lifecycle)

## Using wrappers
Wrappers are used as body processors when preparing the response. Body stored from fixture is provided and the processed body must be returned. The main goal is to get rid of little transformations when providing the body to the fixture. Only one wrapper is allowed per response.

For instance, let's say we're working on a JSON API that expects the server's response to be always wrapped in the same patterns. You can use wrapper and two global presets to get rid of emulating this behavior each time you're creating a fixture :

```javascript
import {presets, Server} from 'fetch-mock-fixtures';

// Add the presets to global presets object
// You can do it in your tests bootstrap
presets = Object.assign(presets, {
  'api-success': {
    headers: {'content-type': 'application/json'},
    wrapper: body => JSON.stringify({
      success: true,
      data: body
    })
  },
  'api-failure': {
    headers: {'content-type': 'application/json'},
    wrapper: body => JSON.stringify({
      success: false
      error: body
    })
  }
})

// In tests scripts
const server = new Server()

server.respond.with.preset('api-success').and.body({
  id: 1,
  name: 'foo'
});

// Parsed JSON response will be {success: true, data: {id: 1, name: 'foo'}}

```
## Using patterns
Patterns are a way to automatically extract parameters from the url. They will be provided as an object and first argument to the body callback (see fixtures#body_callback).

To extract params, url is parsed with [`path-to-regexp`](https://github.com/pillarjs/path-to-regexp#readme). Please refer to this for advanced syntax.

Here's a simple example that use extract user id from url :

```javascript
import {Server} from 'fetch-mock-fixtures';

users = [
  {id: 1, name: 'foo'},
  {id: 2, name: 'bar'},
  {id: 3, name: 'baz'},
]

server.start().respond
  .with.pattern('/api/users/:id?')
  .and.body({id} => return id ? users.find(user => user.id === id) || users)

```
