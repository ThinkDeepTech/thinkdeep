import log4js from 'log4js';

import config from './config.mjs';

const getLogger = () => {
    const logger = log4js.getLogger();
    logger.level = config.logLevel.toLowerCase();
    return logger;
};

export { getLogger };