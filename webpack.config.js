'use-strict';

const CleanWebpackPlugin = require('clean-webpack-plugin');
const CopyWebpackPlugin = require('copy-webpack-plugin');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const webpack = require('webpack');
const path = require('path');
const { rules } = require('@thinkdeep/tools/config/webpack.shared.config').module;

const OUTPUT_DIR = path.resolve(__dirname, 'build');
const AUTOGEN_DIR = path.resolve(OUTPUT_DIR, 'vendor');

const dirsToClean = [OUTPUT_DIR];

module.exports = {
  entry: './demo/all.js',
  mode: 'development',
  output: {
    path: OUTPUT_DIR
  },
  devServer: {
    contentBase: path.resolve(OUTPUT_DIR),
    hot: true
  },
  module: {
    rules
  },
  plugins: [
    new CleanWebpackPlugin(dirsToClean),
    new CopyWebpackPlugin([
      {
        from: path.resolve('node_modules/@webcomponents/webcomponentsjs/webcomponents-bundle.js'),
        to: path.resolve(AUTOGEN_DIR)
      },
      {
        from: path.resolve(
          'node_modules/@webcomponents/webcomponentsjs/custom-elements-es5-adapter.js'
        ),
        to: path.resolve(AUTOGEN_DIR)
      }
    ]),
    new HtmlWebpackPlugin({
      template: path.resolve('./demo/index.html')
    }),
    new webpack.HotModuleReplacementPlugin()
  ]
};
