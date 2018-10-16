/** @fileoverview Bootstraps the test bundle for karma-webpack. */
const testsContext = require.context('../packages', true, /\.karma\.js$/);
testsContext.keys().forEach(testsContext);
