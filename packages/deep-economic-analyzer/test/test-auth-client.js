import {Auth0Client} from '@auth0/auth0-spa-js';
import sinon from 'sinon';

let _accessToken = '';
let _idToken = '';
let _initialized = false;

/**
 * Initialize the module.
 *
 * NOTE: This fetches data from the API needed to communicate with the back-end.
 *
 * @param {String} username Username with which to login.
 * @param {String} password User password.
 */
const initialize = async (username, password) => {
  if (!_initialized) {
    const url = process.env.PREDECOS_TEST_AUTH_LOGIN_URL;
    const audience = process.env.PREDECOS_AUTH_AUDIENCE;
    const scope = process.env.PREDECOS_TEST_AUTH_SCOPE;
    const clientId = process.env.PREDECOS_AUTH_CLIENT_ID;
    const clientSecret = process.env.PREDECOS_TEST_AUTH_CLIENT_SECRET;

    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'content-type': 'application/json',
      },
      body: JSON.stringify({
        grant_type: 'password',
        username,
        password,
        audience,
        scope,
        client_id: clientId,
        client_secret: clientSecret,
      }),
    });

    const body = await response.json();

    if (!body.access_token) {
      throw new Error(`The ID Token needs to be defined.`);
    }
    _accessToken = body.access_token;

    if (!body.id_token) {
      throw new Error(`The ID Token needs to be defined.`);
    }
    _idToken = body.id_token;

    _initialized = true;
  }
};

/**
 * Load the test auth client into the system for e2e testing.
 *
 * NOTE: THIS IS FOR E2E TESTING ONLY.
 *
 * @param {String} email Email with which to login.
 * @param {String} password User password.
 */
const testAuthClient = async (
  email = process.env.PREDECOS_TEST_AUTH_USERNAME,
  password = process.env.PREDECOS_TEST_AUTH_PASSWORD
) => {
  await initialize(email, password);

  const authClient = sinon.createStubInstance(Auth0Client);

  authClient.getUser.returns(
    Promise.resolve({
      email,
    })
  );
  authClient.isAuthenticated.returns(true);
  authClient.getTokenSilently.returns(Promise.resolve(_accessToken));
  authClient.getIdTokenClaims.returns(Promise.resolve({__raw: _idToken}));

  return authClient;
};

export {testAuthClient};
