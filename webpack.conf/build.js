const webpack = require('webpack');
const path = require('path');
const merge = require('webpack-merge');
const base = require('./base.js');
const CleanWebpackPlugin = require('clean-webpack-plugin');
// const BundleAnalyzerPlugin = require('webpack-bundle-analyzer').BundleAnalyzerPlugin;

module.exports = merge(base, {
  devtool: false,
  mode: 'production',
  output: {
    path: path.resolve('./dist'),
    filename: 'index.min.js'
  },
  plugins: [
    new webpack.IgnorePlugin(/fixtures/),
    new CleanWebpackPlugin(['dist/**/*'], {root: path.resolve('./')}),
    new webpack.optimize.ModuleConcatenationPlugin(),
  //  new BundleAnalyzerPlugin()
  ]
});
