# Server control, configuration and history
Before being used, you must create a server instance :

```javascript
import Server from 'fetch-mock-fixtures'

const server = new Server()
```

The constructor takes no arguments. Global presets are loaded when server instance is created. From server instance, you can start, stop and reset the server, configure presets and fixtures and access server history.

## Server control
Method / Property  |  Description
--|--
`start()`  | Start the server by mocking native `window.fetch` with a [Sinon stub](https://sinonjs.org/releases/latest/stubs/)
`stop(reset=false)`  |  Stop the server by restoring `window.fetch`. You can optionally pass `true` as argument to also reset the server
`reset(resetStub=true)`  | Reset the server (clear all fixtures and history) and, optionnally reset the stub history
`running`  |  If `true` server is running
`stub`  |  Direct access to the sinon stub

## Adding fixtures to server
Adding fixtures to the server is pretty simple. See [fixtures](fixtures.html) documentation.

## Error management
When encountering an error during configuration, the server will throw an error.

During request processing, the server will display a warning in console and send back a 500 response with error description. This behavior can be changed with :
- `warnOnError(true|false)` : Activate/deactivate warnings in console
- `throwOnError(true|false)` : If `true`, tells the server to throw an error instead of sending back a 500 error.

## Server's history
The server keeps track of all incoming requests and responses. As convenience, you can access the last request and response by calling `server.request` or `server.response`. For more advanced selection tools, the history is available under `server.history`. See [history tests](../test-file/tests/units/history.spec.js.html) for available tools.

The request is stored as a FMFRequest that also exposes parsed informations about the url using [url-parse](https://github.com/unshiftio/url-parse#readme)).
