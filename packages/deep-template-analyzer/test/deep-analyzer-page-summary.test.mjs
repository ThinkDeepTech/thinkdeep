// import {html, litFixtureSync, expect} from '@open-wc/testing';
// import { delayForPageRender, path } from '@thinkdeep/tools/test-helper.mjs';
// import { translate } from 'lit-element-i18n';
import sinon from 'sinon';

// import '../deep-analyzer-page-summary';
import { setAuthClientForTesting } from '../user.mjs';
import { setApolloClientForTesting } from '../graphql/client.mjs';

describe('deep-analyzer-page-summary', () => {

    let authClient;
    beforeEach(async () => {

        globalThis.PREDECOS_AUTH_AUDIENCE = 'thing';
        globalThis.PREDECOS_MICROSERVICE_GATEWAY_URL = 'notimportant';
        authClient = {
            getUser: sinon.stub(),
            isAuthenticated: sinon.stub(),
            getTokenSilently: sinon.stub(),
            loginWithRedirect: sinon.stub(),
            getIdTokenClaims: sinon.stub(),
            logout: sinon.stub()
        };
        authClient.getUser.returns(Promise.resolve({}));
        authClient.isAuthenticated.returns(Promise.resolve(false));
        authClient.getTokenSilently.returns(Promise.resolve('1'));
        authClient.getIdTokenClaims.returns(Promise.resolve({ __raw: 2 }));
        setAuthClientForTesting(authClient);

        setApolloClientForTesting({});
    });

    it('should allow users to collect data for a desired business', () => {

    })

    it('should allow users to analyze collected data', () => {

    })

    it('should allow users to select analysis for a business that was just collected', () => {

    })

    it('should display a graph of sentiment vs time', () => {

    })

    it('should display tweets when the user clicks on a point on the sentiment graph', () => {

    })
})