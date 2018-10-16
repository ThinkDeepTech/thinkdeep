module.exports = {
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
  }
};
