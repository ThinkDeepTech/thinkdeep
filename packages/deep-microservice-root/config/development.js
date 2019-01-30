import log4js from 'log4js';
import loggingConfig from './logging';
log4js.configure(loggingConfig);

export default {
  host: {
    name: 'localhost',
    port: 3000
  }
};
