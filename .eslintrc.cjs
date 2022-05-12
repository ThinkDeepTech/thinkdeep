const path = require('path');

const parentDirectory = (pathname) => {
  return path.basename(path.dirname(pathname));
}

const monorepoRoot = parentDirectory(parentDirectory(process.cwd()));

module.exports = {
  env: {
    browser: true,
    node: true,
    mocha: true
  },
  extends: ['eslint:recommended', 'standard', 'google', 'prettier'],
  parser: '@babel/eslint-parser',
  parserOptions: {
    ecmaVersion: 2020,
    sourceType: 'module',
    requireConfigFile: false,
    babelOptions: {
      babelrcRoots: [process.cwd(), `${monorepoRoot}/packages/*`, `${monorepoRoot}`],
      rootMode: 'upward'
    },
  },
  globals: {
    describe: true,
    beforeEach: true,
    afterEach: true,
    it: true,
    expect: true,
    sinon: true,
    globalThis: true,
  },
};
