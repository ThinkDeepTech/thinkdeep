import config from '@thinkdeep/tools/web-test-runner.config.js';

// NOTE: This port must match that configured for the test client in auth0. Otherwise, the integration tests won't
// be able to log in.
config.port = 9000;

config.http2 = true;
config.sslKey = '/home/hayden/ssl/localhost.key.pem';
config.sslCert = '/home/hayden/ssl/localhost.cert.pem';

export default config;
