module.exports = {
  env: {
    browser: true,
    es6: true,
    node: true
  },
  extends: ["vaadin", "prettier"],
  parser: "babel-eslint",
  parserOptions: {
    sourceType: "module"
  }
};
