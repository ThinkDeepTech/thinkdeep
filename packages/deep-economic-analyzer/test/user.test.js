import {expect} from '@open-wc/testing';
import sinon from 'sinon';

import {
  user,
  premium,
  setAuthClientForTesting,
} from '@thinkdeep/deep-economic-analyzer/user.js';

describe('user file', () => {
  describe('user fcn', () => {
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
      await user();
      expect(authClient.getTokenSilently.callCount).to.be.greaterThan(0);
    });

    it('should return the access token in the user object', async () => {
      const accessToken = 'token';
      authClient.isAuthenticated.returns(Promise.resolve(true));
      authClient.getTokenSilently.returns(Promise.resolve(accessToken));
      const _user = await user();
      expect(_user.accessToken).to.equal(accessToken);
    });

    it('should fetch the user profile', async () => {
      await user();
      expect(authClient.getUser.callCount).to.be.greaterThan(0);
    });

    it('should allow the user to log in', async () => {
      const _user = await user();
      await _user.login();
      expect(authClient.loginWithRedirect.callCount).to.be.greaterThan(0);
    });

    it('should allow the user to log out', async () => {
      const _user = await user();
      await _user.logout();
      expect(authClient.logout.callCount).to.be.greaterThan(0);
    });

    it('should throw an error if the audience is not provided', (done) => {
      setAuthClientForTesting(null);

      user({domain: 'somedomain', clientId: 'someid'}).then(
        () => {
          done('user() did not throw error');
        },
        () => {
          done();
        }
      );
    });

    it('should throw an error if the domain is not provided', (done) => {
      setAuthClientForTesting(null);

      user({clientId: 'someid', audience: 'someaudience'}).then(
        () => {
          done('user() did not throw error');
        },
        () => {
          done();
        }
      );
    });

    it('should throw an error if the client id is not provided', (done) => {
      setAuthClientForTesting(null);

      user({domain: 'somedomain', audience: 'someaudience'}).then(
        () => {
          done('user() did not throw error');
        },
        () => {
          done();
        }
      );
    });
  });

  describe('premium', () => {
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

    it('should return true if the user has the role premium-user', async () => {
      authClient.getUser.returns(
        Promise.resolve({
          'https://predecos.com/roles': ['premium-user'],
        })
      );

      const usr = await user();

      expect(premium(usr)).to.equal(true);
    });

    it('should return false if the user does not have the role premium-user', async () => {
      authClient.getUser.returns(
        Promise.resolve({
          'https://predecos.com/roles': ['standard-user'],
        })
      );

      const usr = await user();

      expect(premium(usr)).to.equal(false);
    });
  });
});
