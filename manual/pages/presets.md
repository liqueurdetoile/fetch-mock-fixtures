# Presets

## Using presets
You can tell a fixture to use a preset to build its response by simply calling its `preset` method with the name of the preset :

```javascript
const server = new Server();

server.respond.with.preset(400);
```

The preset is only evaluated and merged by the fixture at request time. You can easily override preset options through [fixture response configuration](fixtures.html).

If the preset is not found in the server instance, an exception will be raised at request time.

## Local presets

### Adding/editing a local preset
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

Server will now have `myPreset` available in its own presets pool. If the presets was already defined, it will be overridden with new options.

**Note : the options that are not overridden will be kept as is**.

```javascript
const server = new Server();

server.preset('myPreset', {status: 250, statusText: 'weird status'});

// Later on
server.preset('myPreset').status(200);
// statusText will still equal 'weird status'
```

You can have a look at the [response configuration](response-configuration.html) for more details about the available options.

### Removing preset
Simply call the `remove` method of the preset :
```javascript
  server.preset('myPreset').remove();
```
## Using global presets
Aside local presets that can be defined within a server instance, FMF allows the registration of global presets. Global presets can be added/updated/removed in two ways :

### Global `presets` singleton exports
Global presets are stored in a singleton available through the `presets` export. Object can be updated at will.

```javascript
import {presets} from 'fetch-mock-fixtures';

presets.myPreset = {
  status: 250
  statusText: 'weird status'
} // myPreset will now be available globally
```

That way is interesting when bootstrapping presets configuration before running tests suite.

### Register/unregister a local preset as global
Since FMF 2.2.0, it is possible to manage global presets from any server instance.

Any local preset can be made global through `register` method and any global preset can be removed with `unregister` method.

```javascript
const server = new Server();
// Create a local preset
const myPreset = server.preset('myPreset', {status: 250, statusText: 'weird status'});
// And register it as global
myPreset.register();
// Remove the preset from global pool
// It will still be available in the server instance
myPreset.unregister();
```

Methods are chainable :
```javascript
const server = new Server();

// Register the preset, unregister it and remove it from server presets pool
server.preset('myPreset').status(250).register().unregister().remove();
```

### Global presets availability
To allow easy local tweaking of presets, global presets are cloned into local pool when creating a new server instance. Therefore, server's instance will only access global presets that are already defined before its creation or created within the server instance.

### Built-in presets
FMF already have commonly used built-in presets. See [`presets.js`](../file/src/presets.js.html) for details.
