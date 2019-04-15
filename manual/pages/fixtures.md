# Fixture in-depth
The fixture is the heart of FMF. Basically, a fixture organizes :
- the response content (body, headers, status, statusText) and additional options (delay, wrapper, pattern, before and after hooks)
- Optionally, the conditions that the request must match to allow use of the fixture

## Request processing
When the server receives a request, it :
1. tries to find a fixture with conditions that are matching explicitly the request. If multiple fixtures are found, it uses the first one. If none is found, it uses the fallback fixture if available or raise and error,
2. passes the request to the fixture and await the response that triggers the fixture lifecycle,
3. send back the response or an error if a problem occurred (see [server error management](server.html#Error_management)).

## Fixture lifecycle
When provided with the request, the fixture will :

1. Process the `before` hook is one have been set,
2. Extract parameters from the url if a pattern have been set,
3. Process the body callback or get the body value,
4. Finalize the response setup from preset (if one have been used) and its own response configuration,
5. Apply wrapper to body if one is set
6. Construct a Response instance from response configuration
7. Process the `after` hook if one have been set,
8. Delay the response if asked to,
9. Return the response to the server instance.

You can use any of hooks and body callback to amend response content or even cut the lifecycle by throwing another response or error.

## Fixture hooks and body callback
In each hooks and callbacks, you can throw to stop fixture processing. If you throw :
- A Response instance, it will be send back to the client immediately
- A Preset instance, it will be used to send back a response (useful for an HTTP error for instance)
- An error, it will used accordingly to server error management configuration

### `before` hook
It occurs at the very start of the fixture request processing. It receives the server instance, the request and the actual response configuration of the fixture as arguments.

You can return an updated response object that will be used for the rest of the lifecycle.

```javascript
import {Server} from 'fetch-mock-fixtures'

const server = new Server();

server.respond.before((server, request, response) => {
  // Detect multiple identical requests
  if(request.url === server.request.url) throw new Error('Duplicate requests');
})
```
### Body callback ###
The body callback is provided with two arguments :
- The params parsed from the request url as a key/value object
- An object exposing request, response and server as properties

This is the best place for building [dynamic fixtures](../test-file/tests/examples/filesystem.fixture.spec.js.html) as parameterss are directly provided to the callback.

### `after` hook
The after hook is ran at the very end and is provided with the server instance and Response instance as arguments.

It is most likely the place to do some cleanings or data resets between calls.

### Hooks scope
The hooks are called within the scope of the fixture and `this` will refer to the fixture instance **only if using regular function declaration**. The scope of an arrow function is where the function have been declared, usually your test suite. For instance, to extract parameters from the `before` hook :

```javascript
import {Server} from 'fetch-mock-fixtures'

const server = new Server();

// Won't work - Scope problem
server.respond.before((server, request, response) => {
  const params = this.extractParams(request.pathname, response.pattern);
})

// This will work
server.respond.before(function(server, request, response) {
  const params = this.extractParams(request.pathname, response.pattern);
})
```

## Adding fixtures to server
As soon as you have some sample data you are using in many tests, it may be appropriate to stop adding fixtures on-the-fly to the server instance.

For simple datasets, a bunch of presets may be handful but if you're going on using calls count (see [requests matcher](requests_matcher.html)), you can simply declare all your fixtures in one file that you can import/require into your test script. Then, you can simply add fixtures to the server by importing them :

```javascript
import {Server} from 'fetch-mock-fixtures'
import fixtures from '../myfixtures';

const server = new Server();
server.import(fixtures);
```

The fixtures can be response configuration object or fixtures instance.
