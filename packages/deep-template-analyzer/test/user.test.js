import {
  expect,
  //   assert,
} from '@open-wc/testing';
import sinon from 'sinon';

import {getUser, test} from '@thinkdeep/deep-template-analyzer/user.mjs';
const {setAuthClientForTesting} = test;

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
        getUser: sinon.stub(),
      };
      setAuthClientForTesting(authClient);
    });

    // it('should initialize auth instance if it has not yet been used', () => {
    //     assert.fail();
    // });

    it('should fetch the access token if the user is logged in', async () => {
      authClient.isAuthenticated.returns(Promise.resolve(true));
      await getUser();
      expect(authClient.getTokenSilently).to.have.been.called;
    });

    it('should return the access token in the user object', async () => {
      const accessToken = 'token';
      authClient.isAuthenticated.returns(Promise.resolve(true));
      authClient.getTokenSilently.returns(Promise.resolve(accessToken));
      const user = await getUser();
      expect(user.token).to.equal(accessToken);
    });

    it('should fetch the user profile', async () => {
      await getUser();
      expect(authClient.getUser).to.have.been.called;
    });

    // it('should allow the user to log in', async () => {
    //     const user = await getUser();
    //     await user.login();
    //     expect(authClient.loginWithRedirect).to.have.been.called;
    // });

    // it('should allow the user to log out', async () => {
    //     const user = await getUser();
    //     await user.logout();
    //     expect(authClient.logout).to.have.been.called;
    // });

    // it('should throw an error if the audience is not provided', async () => {

    // });

    // it('should throw an error if the domain is not provided', () => {

    // });

    // it('should throw an error if the client id is not provided', () => {

    // });
  });
});
