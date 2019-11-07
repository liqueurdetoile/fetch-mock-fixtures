const webpack = require('webpack');
const path = require('path');
const merge = require('webpack-merge');
const base = require('./base.js');
const TerserPlugin = require('terser-webpack-plugin');

module.exports = merge(base, {
  devtool: false,
  mode: 'production',
  output: {
    path: path.resolve('./dist'),
    filename: 'index.min.js'
  },
  optimization: {
    minimizer: [
      new TerserPlugin({
        terserOptions: {
          keep_classnames: true
        }
      }),
    ],
  },
  plugins: [
    new webpack.IgnorePlugin(/fixtures/),
    new webpack.optimize.ModuleConcatenationPlugin()
  ]
});
