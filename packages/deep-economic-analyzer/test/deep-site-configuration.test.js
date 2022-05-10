// import {html, litFixtureSync, expect} from '@open-wc/testing';
// import { delayForPageRender, path } from '@thinkdeep/tools/test-helper.js';
// import { translate } from 'lit-element-i18n';
import sinon from 'sinon';

// import '../deep-site-configuration.js';
import {setAuthClientForTesting} from '../user.js';
import {setApolloClientForTesting} from '../graphql/client.js';

describe('deep-site-configuration', () => {
  let authClient;
  beforeEach(async () => {
    authClient = {
      getUser: sinon.stub(),
      isAuthenticated: sinon.stub(),
      getTokenSilently: sinon.stub(),
      loginWithRedirect: sinon.stub(),
      getIdTokenClaims: sinon.stub(),
      logout: sinon.stub(),
    };
    authClient.getUser.returns(Promise.resolve({}));
    authClient.isAuthenticated.returns(Promise.resolve(false));
    authClient.getTokenSilently.returns(Promise.resolve('1'));
    authClient.getIdTokenClaims.returns(Promise.resolve({__raw: 2}));
    setAuthClientForTesting(authClient);

    setApolloClientForTesting({});
  });

  it('should fire a site-configuration event on change of the configuration', () => {});
});
