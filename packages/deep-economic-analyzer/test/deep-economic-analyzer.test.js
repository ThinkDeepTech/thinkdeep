import {html, litFixtureSync, expect} from '@open-wc/testing';
import { delayForPageRender } from '@thinkdeep/tools/test-helper.js';
import { translate } from 'lit-element-i18n';
import sinon from 'sinon';

import '../deep-economic-analyzer.js';
import { setAuthClientForTesting } from '../user.js';
import { setApolloClientForTesting } from '../graphql/client.js';

const navigationItems = (parent) => {
    return parent.shadowRoot.querySelectorAll('mwc-top-app-bar-fixed > mwc-icon-button');
}

describe('deep-economic-analyzer', () => {

    let authClient;
    beforeEach(() => {

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

    it('should show the home page by default', async () => {
        const element = await litFixtureSync(html`
            <deep-economic-analyzer></deep-economic-analyzer>
        `);
        await delayForPageRender();
        const homePage = element.shadowRoot.querySelector('deep-analyzer-page-home');
        expect(homePage).not.to.equal(undefined);
        expect(homePage).not.to.equal(null);
    });

    it('should let visitors know the website is experimental', async () => {
        const element = await litFixtureSync(html`
            <deep-economic-analyzer></deep-economic-analyzer>
        `);
        await delayForPageRender();
        const homePage = element.shadowRoot.querySelector('deep-analyzer-page-home');
        const welcomeText = homePage.shadowRoot.querySelector('h1').textContent;
        expect(welcomeText).to.equal('This site is experimental.');
    });

    it('should only show unprotected menu items before the user logs in', async() => {
        const element = await litFixtureSync(html`
            <deep-economic-analyzer></deep-economic-analyzer>
        `);
        await delayForPageRender();
        const navItems = navigationItems(element);
        expect(navItems.length).to.equal(2);
        expect(navItems[0].ariaLabel).to.equal('Home');
        expect(navItems[1].ariaLabel).to.equal(translate('translations:loginPageLabel'));
    });

    it('should not allow navigation to the summary page when the user sets the url if they are not logged in', async () => {
        const element = await litFixtureSync(html`
            <deep-economic-analyzer></deep-economic-analyzer>
        `);
        await delayForPageRender();

        const unknownPageAnchor = document.createElement('a');
        unknownPageAnchor.href = translate('translations:summaryPageLabel');
        element.appendChild(unknownPageAnchor);

        const navItems = navigationItems(element);

        unknownPageAnchor.click();
        await delayForPageRender();

        const pageNotFound = element.shadowRoot.querySelector('deep-analyzer-page-not-found');
        expect(pageNotFound).not.to.equal(undefined);
        expect(pageNotFound).not.to.equal(null);

        navItems[0].click();
    });

    it('should show protected routes when the user is logged in', async () => {
        authClient.isAuthenticated.returns(Promise.resolve(true));

        const element = await litFixtureSync(html`
            <deep-economic-analyzer></deep-economic-analyzer>
        `);
        await delayForPageRender();

        const navItems = navigationItems(element);
        expect(navItems.length).to.equal(3);
        expect(navItems[0].ariaLabel).to.equal('Home');
        expect(navItems[1].ariaLabel).to.equal(translate('translations:summaryPageLabel'));
        expect(navItems[2].ariaLabel).to.equal(translate('translations:logoutPageLabel'));
    });

    it('should initiate the log in screen when the user clicks log in', async() => {
        const element = await litFixtureSync(html`
            <deep-economic-analyzer></deep-economic-analyzer>
        `);
        await delayForPageRender();
        const navItems = navigationItems(element);
        expect(navItems[1].ariaLabel).to.equal(translate('translations:loginPageLabel'));

        navItems[1].click();
        await delayForPageRender();
        expect(authClient.loginWithRedirect.callCount).to.be.greaterThan(0);

        navItems[0].click();
    });
})