# Getting started

** For installation tips, please consult [documentation home](index.html#installation). **

** Note on ES6 syntax : ** In all examples here, we're using ES6 modules import and, sometimes, the new spread operator. We're also using async/await syntax for asynchronous calls. All are supported natively by modern browsers.

FMF itself have been transpiled with Babel to support only alive browsers that share more than 5% of the market. It means that FMF is really not designed to test apps which are willing to support really old browsers as it will certainly be unsupported by them when testing. Nevertheless, you can still try to tweak the build to increase browsers coverage but with no guarantee.

At its most basic intend, FMF can be simply used as a convenient way to trap a remote `fetch` call and send a given response. For this to work, the server must have been started and provided with the response. At the end, the server must be stopped in order to resume on native `fetch` API.

Here's a simple example :

```javascript
import Server from 'fetch-mock-fixtures';

const server = new Server();

server.start();

server.respond.with.body('Hello world !');

let response = await fetch(/** can have any arguments */);
let data = await response.text();

console.log(data); // will output Hello world !

// What about the next call ?
response = await fetch(/** can have any arguments */);
data = await response.text();

console.log(data); // will output Hello world again !

server.stop();
```

Nothing too fancy here : we're starting the server, setting it to respond with 'Hello world !', running fetch twice and stop the server.

Behind the scene, we have :
- overridden `window.fetch` to intercept calls
- Set up a single fixture to the server that matches all incoming requests
- restored `window.fetch` to its native state

Please read other parts of the documentation for a more advanced usage.
