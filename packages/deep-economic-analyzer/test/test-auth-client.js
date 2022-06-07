import {Auth0Client} from '@auth0/auth0-spa-js';
import jwtDecode from 'jwt-decode';
import sinon from 'sinon';

const usersLoggedIn = {};

/**
 * Log the user in.
 *
 * NOTE: This fetches data from the API needed to communicate with the back-end.
 *
 * @param {String} username Username with which to login.
 * @param {String} password User password.
 */
const logIn = async (username, password) => {
  if (!alreadyHandledUserLogin(username)) {
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

    if (!body.id_token) {
      throw new Error(`The ID Token needs to be defined.`);
    }

    const accessToken = body.access_token;
    const idToken = body.id_token;
    const profile = jwtDecode(idToken);

    usersLoggedIn[username] = {
      accessToken,
      idToken,
      profile,
    };
  }
};

const alreadyHandledUserLogin = (username) => {
  return username in usersLoggedIn;
};

const userData = (username) => {
  return usersLoggedIn[username] || {accessToken: '', idToken: '', profile: {}};
};

/**
 * Load the test auth client into the system for e2e testing.
 *
 * NOTE: THIS IS FOR E2E TESTING ONLY.
 *
 * @param {String} username Username or email with which to login.
 * @param {String} password User password.
 */
const testAuthClient = async (username, password) => {
  if (!alreadyHandledUserLogin(username)) {
    await logIn(username, password);
  }

  const {accessToken, idToken, profile} = userData(username);

  const authClient = sinon.createStubInstance(Auth0Client);

  authClient.getUser.returns(Promise.resolve(profile));
  authClient.isAuthenticated.returns(true);
  authClient.getTokenSilently.returns(Promise.resolve(accessToken));
  authClient.getIdTokenClaims.returns(Promise.resolve({__raw: idToken}));

  return authClient;
};

export {testAuthClient};
