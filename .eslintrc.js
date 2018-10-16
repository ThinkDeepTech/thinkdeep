module.exports = {
  env: {
    browser: true,
    es6: true,
    node: true
  },
  extends: ['vaadin', 'prettier'],
  parser: 'babel-eslint',
  parserOptions: {
    sourceType: 'module'
  },
  globals: {
    describe: false,
    beforeEach: false,
    afterEach: false,
    it: false,
    expect: false,
    sinon: false
  }
};
