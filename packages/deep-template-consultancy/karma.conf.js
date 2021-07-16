// const babel = require('@rollup/plugin-babel');
const { nodeResolve } = require('@rollup/plugin-node-resolve');
const eslint = require('@rollup/plugin-eslint');

// Karma configuration
// Generated on Tue Jul 13 2021 08:03:13 GMT-0400 (Eastern Daylight Time)

module.exports = function (config) {
  config.set({
    // base path that will be used to resolve all patterns (eg. files, exclude)
    basePath: '',

    // frameworks to use
    // available frameworks: https://www.npmjs.com/search?q=keywords:karma-adapter
    frameworks: ['browserify', 'mocha', 'chai'],

    // plugins to use
    plugins: [
      'karma-browserify',
      'karma-mocha',
      'karma-chai',
      'karma-babel-preprocessor',
      'karma-rollup-preprocessor',
      'karma-chrome-launcher',
      'karma-firefox-launcher',
      'karma-edge-launcher',
      'karma-coverage',
    ],

    // list of files / patterns to load in the browser
    files: [
      { pattern: 'node_modules/@thinkdeep/tools/testing.js', type: 'module', nocache: true },
      { pattern: './**/*.js', type: 'module', nocache: true },
      { pattern: './test/**/*.test.js', type: 'module', nocache: true },
    ],

    // list of files / patterns to exclude
    exclude: ['./build/**/*.js', 'node_modules', './test-main.js', './**/*.config.js'],

    // preprocess matching files before serving them to the browser
    // available preprocessors: https://www.npmjs.com/search?q=keywords:karma-preprocessor
    preprocessors: {
      './**/*.js': ['babel'],
      'node_modules/@thinkdeep/tools/testing.js': ['babel'],
      './test/**/*.test.js': ['babel', 'coverage'],
    },

    babelPreprocessor: {
      options: {
        presets: ['@babel/preset-env'],
      },
    },

    rollupPreprocessor: {
      /**
       * This is just a normal Rollup config object,
       * except that `input` is handled for you.
       */
      output: [
        {
          file: 'build/index.js',
          format: 'es',
          sourcemap: true,
        },
      ],
      plugins: [nodeResolve(), eslint()],
    },

    // test results reporter to use
    // possible values: 'dots', 'progress'
    // available reporters: https://www.npmjs.com/search?q=keywords:karma-reporter
    reporters: ['progress', 'coverage'],

    coverageReporter: {
      reporters: [{ type: 'html', subdir: 'html' }],
      dir: 'coverage/',
    },

    // web server port
    port: 9876,

    // enable / disable colors in the output (reporters and logs)
    colors: true,

    // level of logging
    // possible values: config.LOG_DISABLE || config.LOG_ERROR || config.LOG_WARN || config.LOG_INFO || config.LOG_DEBUG
    logLevel: config.LOG_DEBUG,

    // enable / disable watching file and executing tests whenever any file changes
    autoWatch: true,

    // start these browsers
    // available browser launchers: https://www.npmjs.com/search?q=keywords:karma-launcher
    browsers: ['firefox_private', 'Chrome', 'Edge'],

    customLaunchers: {
      firefox_private: {
        base: 'Firefox',
        flags: ['-private'],
        displayName: 'Firefox Private Mode',
      },
    },

    // Continuous Integration mode
    // if true, Karma captures browsers, runs the tests and exits
    singleRun: false,

    // Concurrency level
    // how many browser instances should be started simultaneously
    concurrency: Infinity,
  });
};
