'use strict';
const path = require('path');

function resolve(dir) {
  return path.join(__dirname, '..', dir);
}

module.exports = {
  entry: {
    'fetch-mf': './src/index.js'
  },
  output: {
    jsonpFunction: 'fetch-mf'
  },
  module: {
    rules: [
      {
        test: /(\.js)$/,
        loader: 'babel-loader',
        exclude: /node_modules/
      }
    ]
  },
  resolve: {
    modules: [
      path.resolve('./node_modules'),
      path.resolve('./src'),
      path.resolve('./tests')
    ],
    extensions: ['.json', '.js'],
    alias: {
      '@': resolve('src'),
      'fixtures': path.resolve('./tests/fixtures')
    }
  }
};
