const merge = require('webpack-merge');
const base = require('./base.js');
const webpack = require('webpack');
const path = require('path');

module.exports = merge(base, {
  devtool: 'inline-cheap-module-source-map',
  mode: 'development',
  output: {
    filename: 'index.js',
    devtoolModuleFilenameTemplate: '[absolute-resource-path]',
    devtoolFallbackModuleFilenameTemplate: '[absolute-resource-path]?[hash]'
  }
});
