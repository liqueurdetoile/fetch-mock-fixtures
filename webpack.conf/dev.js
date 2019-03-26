const merge = require('webpack-merge');
const path = require('path');
const base = require('./base.js');
const webpack = require('webpack');
const CleanWebpackPlugin = require('clean-webpack-plugin');

module.exports = merge(base, {
  devtool: 'inline-source-map',
  mode: 'development',
  output: {
    path: path.resolve('./dev'),
    filename: 'index.js'
  },
  plugins: [
    new CleanWebpackPlugin(['dev/**/*'], {root: path.resolve('./')})
  ]
});
