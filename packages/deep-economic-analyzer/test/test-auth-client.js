import {Auth0Client} from '@auth0/auth0-spa-js';
import sinon from 'sinon';

/**
 * Load the test auth client into the system for e2e testing.
 *
 * NOTE: THIS IS FOR E2E TESTING ONLY.
 *
 * @param {String} username Username with which to login.
 * @param {String} password User password.
 */
const testAuthClient = async (
  username = process.env.PREDECOS_TEST_AUTH0_USERNAME,
  password = process.env.PREDECOS_TEST_AUTH0_PASSWORD
) => {
  const url = process.env.PREDECOS_TEST_AUTH0_LOGIN_URL;
  const audience = process.env.PREDECOS_AUTH_AUDIENCE;
  const scope = process.env.PREDECOS_TEST_AUTH0_SCOPE;
  const clientId = process.env.PREDECOS_AUTH_CLIENT_ID;
  const clientSecret = process.env.PREDECOS_TEST_AUTH0_CLIENT_SECRET;

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

  const authClient = sinon.createStubInstance(Auth0Client);

  authClient.getUser.returns(
    Promise.resolve({
      email: 'predecos.testuser1@gmail.com',
    })
  );
  authClient.isAuthenticated.returns(true);
  authClient.getTokenSilently.returns(Promise.resolve(body.access_token));
  authClient.getIdTokenClaims.returns(Promise.resolve({__raw: body.id_token}));

  return authClient;
};

export {testAuthClient};
