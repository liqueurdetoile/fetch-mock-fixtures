# Presets

## Using presets
You can tell a fixture to use a preset to build its response by simply calling its `preset` method with the name of the preset :

```javascript
const server = new Server();

server.respond.with.preset(400);
```

The preset is only evaluated and merged by the fixture at request time. You can easily override preset through [fixture response configuration](fixtures.html).

If the preset is not found in the server instance, an exception will be raised at request time.

## adding/editing a preset
It can be done by providing an object with its `set` method and/or using BDD style syntax. Alternatively, the configuration object can be provided to `server.preset` :

```javascript
const server = new Server();

// In the server.preset call
server.preset('myPreset', {
  status: 250
  statusText: 'weird status'
});

// Another syntax, the same result
server.preset('myPreset').set({status: 250}).statusText('weird')
```
You can have a look at the [response configuration](response-configuration.html) for more details about the available options.

## Preset scope
A preset can be added to a single server instance or in global scope.

To add a preset to server instance, simply create it with `server.preset`.

To add a preset to the global scope, just amend the `presets` property of the global export :

```javascript
import {presets} from 'fetch-mock-fixtures';

presets.myPreset = {
  status: 250
  statusText: 'weird status'
} // myPreset will now be available globally
```

## Built-in presets
FMF already have commonly used built-in presets. See [`presets.js`](../file/src/presets.js.html) for details.
