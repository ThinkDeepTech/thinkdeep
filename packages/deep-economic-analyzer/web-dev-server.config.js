import config from '@thinkdeep/tools/web-dev-server.config.js';

config.http2 = true;
config.sslKey = process.env.PREDECOS_DEVELOPMENT_SSL_KEY;
config.sslCert = process.env.PREDECOS_DEVELOPMENT_SSL_CERT;

export default config;
