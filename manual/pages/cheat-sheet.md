# Full cheat sheet
## Creating a server instance
```javascript
import {Server} from 'fetch-mock-fixtures';

const server = new Server();
```
## Response setup (preset or fixture)
```javascript
server.preset(string <preset name>) | server.respond | server.fallback
  .with // Syntactic sugar for human readability
  .and // Syntactic sugar for human readability  
  .after(Function <after>) // After callback
  .before(Function <before>) // Before callback
  .body(String|Function <response body>) // Preset body content
  .delay(Number <delay>) // Preset delay response
  .header(String <name>, String <value> [, Boolean <append=false>]) // Configure single header
  .headers(Object|Headers <headers>) // Configure bunch of headers at once
  .pattern(String <pattern>) // Pattern string for parameters analysis
  .set(Object <set-up object>) // Set up any options at once through an object
  .status(Number <status>) // Response status code
  .statusText(String <statusText>) // Response status text
  .wrapper(Function <wrapper>) // Wrapper function applied to body
```

## Ordered responses (fixture)
```javascript
server.respond
  .to // Syntactic sugar for human readability
  .firstCall([Boolean <own = false>]) // Target local/global first call
  .secondCall([Boolean <own = false>]) // Target local/global second call
  .thirdCall([Boolean <own = false>]) // Target local/global third call
  .call(Number <n>, [Boolean <own = false>]) // target nth local/global call
```

## Request matcher setup (fixture)
For request parts details available for comparison, see [url-parse](https://github.com/unshiftio/url-parse#readme) page.

```javascript
server.on | server.when
  .and // Syntactic sugar for human readability
  .is // Syntactic sugar for human readability
  .respond // End request matcher setup and switch to response configuration
  .not // Negate result of the next matching evaluation
   // Target the body and, optionnaly, define a type for the body processor
  .body([String <type=text>])
  .header(String <name>) // Target named header for matching
   // Tells processor to evaluate equality based on expected value
  .equal(Array|Boolean|Function|Number|Object|RegExp|String expected)
  .equals(Array|Boolean|Function|Number|Object|RegExp|String expected)
  .headers
  .query
  .slashes
  .auth
  .cache
  .credentials
  .destination
  .hash
  .href
  .host
  .hostname
  .integrity
  .mode
  .method
  .password
  .pathname
  .port
  .protocol
  .redirect
  .referrer
  .referrerPolicy
  .url
  .username
```

## Starting configuration
- `server.preset()` will start a preset configuration
- `server.on` or `server.when` will start a request matcher configuration
- `server.respond` or `server.fallback` will start a response configuration

All configuration methods are chainable, though one cannot configure a preset and a fixture in the same chain :

```javascript
import {Server} from 'fetch-mock-fixtures';

const server = new Server();

// Configure the success preset and register it globally
server  
  .preset('success')
  .header('content-type', 'application/json')
  .wrapper(data => ({success: true, data}))
  .register()

server
  // Configuration of fixture with matching request
  .on
    .pathname.equal('/api/v1/users')
    .and.method.equal('POST')
  .respond
    .with.preset('success')
    .and.body({token: '123'})
  // Configuration of fallback fixture
  .fallback
    .throw('failed')
```
