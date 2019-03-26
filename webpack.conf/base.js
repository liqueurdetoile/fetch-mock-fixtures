'use strict';

const path = require('path');
const webpack = require('webpack');

function resolve(dir) {
  return path.join(__dirname, '..', dir);
}

module.exports = {
  entry: {
    'fetch-mf': './src/index.js'
  },
  output: {
    jsonpFunction: 'fetch-mf',
    libraryTarget: "umd"
  },
  module: {
    rules: [
      {
        test: /(\.js)$/,
        loader: 'babel-loader',
        exclude: /node_modules|tests/
      }
    ]
  },
  externals: {
    sinon: 'sinon'
  },
  resolve: {
    modules: [
      path.resolve('./node_modules'),
      path.resolve('./src')
    ],
    extensions: ['.js'],
    alias: {
      '@': resolve('src')
    }
  }
};
