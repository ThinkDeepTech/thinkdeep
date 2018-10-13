module.exports = {
  parserOptions: {
    env: {
      es6: true,
      jest: true,
      mocha: true,
      node: true,
      serviceworker: true,
      worker: true
    },
    sourceType: "script",
    extends: ["plugin:polymer/polymer-2"],
    plugins: ["polymer"]
  }
};
