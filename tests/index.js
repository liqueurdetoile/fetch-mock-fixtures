// requires all tests in `project/tests/**/*.spec.js`
const tests = require.context('./', true, /\.spec\.js$/);

tests.keys().forEach(tests);

// requires all components in `project/src/**/*.js`
// const components = require.context('../src/', true, /(main|index)\.js$/);

// components.keys().forEach(components);
