const path = require('path');
const { rules } = require('@thinkdeep/tools/config/webpack.shared.config').module;

module.exports = config => {
  const browsers = ['ChromeHeadlessNoSandbox', 'FirefoxHeadless'];
  if (process.platform.includes('win32')) browsers.push('IE');

  config.set({
    basePath: path.resolve(__dirname),
    singleRun: true,
    browsers,
    customLaunchers: {
      ChromeHeadlessNoSandbox: {
        base: 'ChromeHleadless',
        flags: ['--disable-gpu', '--no-sandbox']
      },
      FirefoxHeadless: {
        base: 'Firefox',
        flags: ['-headless']
      }
    },
    plugins: [
      require('./node_modules/karma-chrome-launcher'),
      require('./node_modules/karma-coverage-istanbul-reporter'),
      require('./node_modules/karma-firefox-launcher'),
      require('./node_modules/karma-ie-launcher'),
      require('./node_modules/karma-mocha'),
      require('./node_modules/karma-mocha-reporter'),
      require('./node_modules/karma-sourcemap-loader'),
      require('./node_modules/karma-sinon-chai'),
      require('./node_modules/karma-sourcemap-loader'),
      require('./node_modules/karma-webpack')
    ],
    frameworks: ['mocha', 'sinon-chai'],
    files: [
      {
        pattern: 'node_modules/@webcomponents/webcomponentsjs/custom-elements-es5-adapter.js',
        watched: false
      },
      {
        pattern: 'node_modules/@webcomponents/webcomponentsjs/webcomponents-bundle.js',
        watched: false
      },
      './utils/test.unit.bootstrap.js'
    ],
    preprocessors: {
      './utils/test.unit.bootstrap.js': ['webpack', 'sourcemap']
    },
    reporters: ['dots', 'coverage-istanbul'],
    port: 9876,
    colors: true,
    logLevel: config.LOG_INFO,

    coverageIstanbulReporter: {
      reports: ['html', 'lcovonly', 'text-summary'],
      dir: path.join(__dirname, 'coverage'),
      combineBrowserReports: true,
      skipFilesWithNoCoverage: true,
      thresholds: {
        global: {
          statements: 80,
          lines: 80,
          branches: 80,
          functions: 80
        }
      }
    },

    client: {
      mocha: {
        reporter: 'html',
        ui: 'bdd'
      },
      chai: {
        includeStack: true
      }
    },

    webpack: {
      devtool: 'inline-source-map',
      mode: 'development',
      module: {
        rules: [
          ...rules,
          {
            test: /\.js$/,
            loader: 'istanbul-instrumenter-loader',
            enforce: 'post',
            include: path.resolve('./packages'),
            exclude: /node_modules\/*/,
            options: {
              esModules: true
            }
          }
        ]
      }
    },

    webpackMiddleware: {
      stats: 'errors-only'
    },

    webpackServer: {
      noInfo: true
    }
  });
};
