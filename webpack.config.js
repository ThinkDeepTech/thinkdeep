// TODO 'use-strict'; ?

const CopyWebpackPlugin = require("copy-webpack-plugin");
const HtmlWebpackPlugin = require("html-webpack-plugin");
const path = require("path");

const OUTPUT_PATH = path.resolve("build");

module.exports = {
  entry: "./demo/all.js",
  mode: "development",
  output: {
    path: OUTPUT_PATH
  },
  module: {
    rules: [
      {
        test: /\.js$/,
        loader: "babel-loader",
        exclude: /node_modules\/(?!(@webcomponents\/shadycss|lit-html|@polymer|@vaadin|@thinkdeep)\/).*/,
        options: {
          cacheDirectory: true
        }
      }
    ]
  },
  plugins: [
    new CopyWebpackPlugin([
      {
        from: path.resolve(
          "node_modules/@webcomponents/webcomponentsjs/webcomponents-bundle.js"
        ),
        to: path.resolve(OUTPUT_PATH, "vendor")
      },
      {
        from: path.resolve(
          "node_modules/@webcomponents/webcomponentsjs/custom-elements-es5-adapter.js"
        ),
        to: path.resolve(OUTPUT_PATH, "vendor")
      }
    ]),
    new HtmlWebpackPlugin({
      template: path.resolve("./demo/index.html")
    })
  ],
  devServer: {
    hot: true
  }
};
