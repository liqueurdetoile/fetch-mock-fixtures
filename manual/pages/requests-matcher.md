# Requests matcher
Each fixture has a built-in requests matcher. You can configure a fixture to match only some requests properties and/or match only calls count.

## Matching request properties
FMF is extending the native Request object with properties build from the parsing of the url with [url-parse](https://github.com/unshiftio/url-parse#readme)). Therefore, you can directly access pathname, port, basic authentication...

Such matching evaluation is built in processors. By this time, there's only a common swiss army knife called `equal`. To add a matching configuration, you can do it with a one-shot call or with BDD style after using `on` or `when` getter.

Have a look to [the tests](../test-file/tests/units/requests.processing.spec.js.html#lineNumber84) for examples on usage.

The next call to `respond` will set the fixture in response configuration mode.

You can then go on next conditional fixture by calling `on` or `when` again.

If you directly call `respond` or `fallback`, you will go on the fallback fixture and create or overwrite it.

The fallback fixture is the one (you can have only one obviously) that have no matching conditions. It will only be used if none of the others fixtures is matching the request.

## Matching calls count
You can also configure a fixture to match only the nth call to the server or the nth call to itself.

You will find [some examples](../test-file/tests/units/requests.processing.spec.js.html#lineNumber63) in tests.
