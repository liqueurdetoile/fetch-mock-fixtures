const merge = require('webpack-merge');
const base = require('./base.js');
const path = require('path');

module.exports = merge(base, {
  devtool: 'inline-cheap-module-source-map',
  mode: 'development',
  output: {
    devtoolModuleFilenameTemplate: '[absolute-resource-path]',
    devtoolFallbackModuleFilenameTemplate: '[absolute-resource-path]?[hash]'
  },
  resolve: {
    alias: {
      "fixtures": path.resolve("./tests/fixtures")
    }
  }
});
