import {testAuthClient} from './test-auth-client.js';
import {user, setAuthClientForTesting} from '../user.js';
import {initApolloClient} from '../graphql/client.js';

/**
 * Initialize the system for e2e testing.
 *
 * @param {String} username Username with which to sign in.
 * @param {String} password Password with which to sign in.
 *
 * @return {Promise<Object>} Promise that resolves to a sinon stubbed auth0 client.
 */
const initializeE2e = async (username, password) => {
  const authClient = await testAuthClient(username, password);

  setAuthClientForTesting(authClient);

  await initApolloClient(await user());

  return authClient;
};

export {initializeE2e};
