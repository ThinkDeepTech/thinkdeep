import {
  expect,
  //   assert,
} from '@open-wc/testing';
import sinon from 'sinon';

import {
  getUser,
  setAuthClientForTesting,
} from '@thinkdeep/deep-economic-analyzer/user.js';

describe('user', () => {
  describe('getUser', () => {
    let authClient = null;
    beforeEach(() => {
      authClient = {
        logout: sinon.stub(),
        loginWithRedirect: sinon.stub(),
        handleRedirectCallback: sinon.stub(),
        isAuthenticated: sinon.stub(),
        getTokenSilently: sinon.stub(),
        getIdTokenClaims: sinon.stub(),
        getUser: sinon.stub(),
      };
      authClient.getIdTokenClaims.returns(Promise.resolve({__raw: 2}));
      setAuthClientForTesting(authClient);
    });

    it('should fetch the access token if the user is logged in', async () => {
      authClient.isAuthenticated.returns(Promise.resolve(true));
      await getUser();
      expect(authClient.getTokenSilently.callCount).to.be.greaterThan(0);
    });

    it('should return the access token in the user object', async () => {
      const accessToken = 'token';
      authClient.isAuthenticated.returns(Promise.resolve(true));
      authClient.getTokenSilently.returns(Promise.resolve(accessToken));
      const user = await getUser();
      expect(user.accessToken).to.equal(accessToken);
    });

    it('should fetch the user profile', async () => {
      await getUser();
      expect(authClient.getUser.callCount).to.be.greaterThan(0);
    });

    it('should allow the user to log in', async () => {
      const user = await getUser();
      await user.login();
      expect(authClient.loginWithRedirect.callCount).to.be.greaterThan(0);
    });

    it('should allow the user to log out', async () => {
      const user = await getUser();
      await user.logout();
      expect(authClient.logout.callCount).to.be.greaterThan(0);
    });

    it('should throw an error if the audience is not provided', (done) => {
      setAuthClientForTesting(null);

      getUser({domain: 'somedomain', clientId: 'someid'}).then(
        () => {
          done('getUser did not throw error');
        },
        (reason) => {
          done();
        }
      );
    });

    it('should throw an error if the domain is not provided', (done) => {
      setAuthClientForTesting(null);

      getUser({clientId: 'someid', audience: 'someaudience'}).then(
        () => {
          done('getUser did not throw error');
        },
        (reason) => {
          done();
        }
      );
    });

    it('should throw an error if the client id is not provided', (done) => {
      setAuthClientForTesting(null);

      getUser({domain: 'somedomain', audience: 'someaudience'}).then(
        () => {
          done('getUser did not throw error');
        },
        (reason) => {
          done();
        }
      );
    });
  });
});
