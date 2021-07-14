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
      'karma-mocha',
      'karma-chai',
      'karma-babel-preprocessor',
      'karma-chrome-launcher',
      'karma-firefox-launcher',
      'karma-edge-launcher',
      'karma-coverage',
      'karma-browserify',
    ],

    // list of files / patterns to load in the browser
    files: [
      // '../../node_modules/@thinkdeep/tools/testing.js',
      'test/**/*.test.js',
    ],

    // list of files / patterns to exclude
    exclude: ['node_modules'],

    // preprocess matching files before serving them to the browser
    // available preprocessors: https://www.npmjs.com/search?q=keywords:karma-preprocessor
    preprocessors: {
      // '../../node_modules/@thinkdeep/tools/testing.js': ['browserify'],
      'test/**/*.test.js': ['browserify', 'coverage'],
    },

    browserify: {
      transform: [['babelify', { presets: ['@babel/preset-env'] }]],
      extensions: ['.js'],
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
    singleRun: true,

    // Concurrency level
    // how many browser instances should be started simultaneously
    concurrency: Infinity,
  });
};
