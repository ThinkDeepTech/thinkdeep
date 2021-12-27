import {html, litFixtureSync, expect} from '@open-wc/testing';
import { delayForPageRender, path } from '@thinkdeep/tools/test-helper.mjs';
import { translate } from 'lit-element-i18n';
import sinon from 'sinon';

import '../deep-template-analyzer.js';
import { setAuthClientForTesting } from '../user.mjs';
import { setApolloClientForTesting } from '../graphql/client.mjs';



describe('deep-template-analyzer', () => {

    let authClient;
    beforeEach(async () => {

        globalThis.PREDECOS_AUTH_AUDIENCE = 'thing';
        globalThis.PREDECOS_MICROSERVICE_GATEWAY_URL = 'notimportant';
        authClient = {
            getUser: sinon.stub(),
            isAuthenticated: sinon.stub(),
            getTokenSilently: sinon.stub(),
            loginWithRedirect: sinon.stub(),
            logout: sinon.stub()
        };
        authClient.getUser.returns(Promise.resolve({}));
        authClient.isAuthenticated.returns(Promise.resolve(false));
        authClient.getTokenSilently.returns(Promise.resolve('1'));
        setAuthClientForTesting(authClient);

        setApolloClientForTesting({});
    });

    it('should show the home page by default', async () => {
        let element = await litFixtureSync(html`
            <deep-template-analyzer></deep-template-analyzer>
        `);
        await delayForPageRender();
        const homePage = element.shadowRoot.querySelector('deep-analyzer-page-home');
        expect(homePage).not.to.equal(undefined);
        expect(homePage).not.to.equal(null);
    });

    it('should let visitors know the website is experimental', async () => {
        let element = await litFixtureSync(html`
            <deep-template-analyzer></deep-template-analyzer>
        `);
        await delayForPageRender();
        const homePage = element.shadowRoot.querySelector('deep-analyzer-page-home');
        const welcomeText = homePage.shadowRoot.querySelector('h1').textContent;
        debugger;
        expect(welcomeText).to.equal('This site is experimental.');
    });

    it('should only show unprotected menu items before the user logs in', async() => {
        let element = await litFixtureSync(html`
            <deep-template-analyzer></deep-template-analyzer>
        `);
        await delayForPageRender();
        const navItems = element.shadowRoot.querySelectorAll('mwc-top-app-bar-fixed > a');
        expect(navItems.length).to.equal(2);
        expect(path(navItems[0])).to.equal('');
        expect(path(navItems[1])).to.equal(translate('translations:loginPageLabel'));
    });

    it('should not allow navigation to the summary page when the user sets the url if they are not logged in', async () => {
        let element = await litFixtureSync(html`
            <deep-template-analyzer></deep-template-analyzer>
        `);
        await delayForPageRender();

        const unknownPageAnchor = document.createElement('a');
        unknownPageAnchor.href = translate('translations:summaryPageLabel');
        element.appendChild(unknownPageAnchor);

        const navItems = element.shadowRoot.querySelectorAll('mwc-top-app-bar-fixed > a');
        for(const navItem of navItems) {
            expect(navItem.href).not.to.include(translate('translations:summaryPageLabel'));
        }

        unknownPageAnchor.click();
        await delayForPageRender();

        const pageNotFound = element.shadowRoot.querySelector('deep-analyzer-page-not-found');
        expect(pageNotFound).not.to.equal(undefined);
        expect(pageNotFound).not.to.equal(null);

        navItems[0].click();
    });

    it('should show protected routes when the user is logged in', async () => {
        authClient.isAuthenticated.returns(Promise.resolve(true));

        let element = await litFixtureSync(html`
            <deep-template-analyzer></deep-template-analyzer>
        `);
        await delayForPageRender();

        const navItems = element.shadowRoot.querySelectorAll('mwc-top-app-bar-fixed > a');
        expect(navItems.length).to.equal(3);
        expect(path(navItems[0])).to.equal('');
        expect(path(navItems[1])).to.equal(translate('translations:summaryPageLabel'));
        expect(path(navItems[2])).to.equal(translate('translations:logoutPageLabel'));
    });

    it('should initiate the log in screen when the user clicks log in', async() => {
        let element = await litFixtureSync(html`
            <deep-template-analyzer></deep-template-analyzer>
        `);
        await delayForPageRender();
        const navItems = element.shadowRoot.querySelectorAll('mwc-top-app-bar-fixed > a');
        expect(path(navItems[1])).to.equal(translate('translations:loginPageLabel'));

        navItems[1].click();
        await delayForPageRender();
        expect(authClient.loginWithRedirect).to.have.been.called;

        navItems[0].click();
    });
})