import {testAuthClient} from './test-auth-client.js';
import {getUser, setAuthClientForTesting} from '../user.js';
import {initApolloClient} from '../graphql/client.js';

/**
 * Initialize the system for e2e testing.
 * @return {Object} Sinon stubbed auth0 client.
 */
const initializeE2e = async () => {
  const authClient = await testAuthClient();

  setAuthClientForTesting(authClient);

  const user = await getUser();

  // TODO Pass user into apollo client
  await initApolloClient(user);

  return authClient;
};

export {initializeE2e};
