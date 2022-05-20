import config from '@thinkdeep/tools/web-dev-server.config.js';

config.http2 = true;
config.sslKey = '/home/hayden/ssl/localhost.key.pem';
config.sslCert = '/home/hayden/ssl/localhost.cert.pem';

export default config;
