import {html, expect} from '@open-wc/testing';
import {click, fixtureSync} from '@thinkdeep/tools/test-helper.js';
import {initializeE2e} from './initialize-e2e.js';
import {translate} from 'lit-element-i18n';

import '../deep-economic-analyzer.js';

const navigationItems = (parent) => {
  return parent.shadowRoot.querySelectorAll(
    'mwc-top-app-bar-fixed > mwc-icon-button'
  );
};

describe('deep-economic-analyzer', () => {
  describe('when the user has not logged in', () => {
    let authClient;
    beforeEach(async () => {
      authClient = await initializeE2e(
        process.env.PREDECOS_TEST_AUTH_STANDARD_USERNAME,
        process.env.PREDECOS_TEST_AUTH_STANDARD_PASSWORD
      );
      authClient.isAuthenticated.returns(Promise.resolve(false));
    });

    it('should show the home page by default', async () => {
      const element = await fixtureSync(html`
        <deep-economic-analyzer></deep-economic-analyzer>
      `);
      const homePage = element.shadowRoot.querySelector(
        'deep-analyzer-page-home'
      );
      expect(homePage).not.to.equal(undefined);
      expect(homePage).not.to.equal(null);
    });

    it('should only show unprotected menu items', async () => {
      const element = await fixtureSync(html`
        <deep-economic-analyzer></deep-economic-analyzer>
      `);
      const navItems = navigationItems(element);
      expect(navItems.length).to.equal(2);
      expect(navItems[0].ariaLabel).to.equal('Home');
      expect(navItems[1].ariaLabel).to.equal(
        translate('translations:loginPageLabel')
      );
    });

    it('should not allow navigation to the summary page when the user sets the url', async () => {
      const element = await fixtureSync(html`
        <deep-economic-analyzer></deep-economic-analyzer>
      `);

      const unknownPageAnchor = document.createElement('a');
      unknownPageAnchor.href = translate('translations:summaryPageLabel');
      element.appendChild(unknownPageAnchor);

      const navItems = navigationItems(element);

      await click(unknownPageAnchor);

      const pageNotFound = element.shadowRoot.querySelector(
        'deep-analyzer-page-not-found'
      );
      expect(pageNotFound).not.to.equal(undefined);
      expect(pageNotFound).not.to.equal(null);

      await click(navItems[0]);
    });

    it('should initiate the log in screen when the user clicks log in', async () => {
      const element = await fixtureSync(html`
        <deep-economic-analyzer></deep-economic-analyzer>
      `);
      const navItems = navigationItems(element);
      expect(navItems[1].ariaLabel).to.equal(
        translate('translations:loginPageLabel')
      );

      await click(navItems[1]);
      expect(authClient.loginWithRedirect.callCount).to.be.greaterThan(0);

      navItems[0].click();
      await click(navItems[0]);
    });
  });

  describe('when a standard user logs in', () => {
    beforeEach(async () => {
      await initializeE2e(
        process.env.PREDECOS_TEST_AUTH_STANDARD_USERNAME,
        process.env.PREDECOS_TEST_AUTH_STANDARD_PASSWORD
      );
    });

    it('should not show protected routes', async () => {
      const element = await fixtureSync(html`
        <deep-economic-analyzer></deep-economic-analyzer>
      `);

      const navItems = navigationItems(element);
      expect(navItems.length).to.equal(2);
      expect(navItems[0].ariaLabel).to.equal('Home');
      expect(navItems[1].ariaLabel).to.equal(
        translate('translations:logoutPageLabel')
      );
    });

    it('should not allow navigation to the summary', async () => {
      const element = await fixtureSync(html`
        <deep-economic-analyzer></deep-economic-analyzer>
      `);

      const unknownPageAnchor = document.createElement('a');
      unknownPageAnchor.href = translate('translations:summaryPageLabel');
      element.appendChild(unknownPageAnchor);

      const navItems = navigationItems(element);

      await click(unknownPageAnchor);

      const pageNotFound = element.shadowRoot.querySelector(
        'deep-analyzer-page-not-found'
      );
      expect(pageNotFound).not.to.equal(undefined);
      expect(pageNotFound).not.to.equal(null);

      await click(navItems[0]);
    });
  });

  describe('when a premium member logs in', () => {
    beforeEach(async () => {
      await initializeE2e(
        process.env.PREDECOS_TEST_AUTH_PREMIUM_USERNAME,
        process.env.PREDECOS_TEST_AUTH_PREMIUM_PASSWORD
      );
    });

    it('should show protected routes', async () => {
      const element = await fixtureSync(html`
        <deep-economic-analyzer></deep-economic-analyzer>
      `);

      const navItems = navigationItems(element);
      expect(navItems.length).to.equal(3);
      expect(navItems[0].ariaLabel).to.equal('Home');
      expect(navItems[1].ariaLabel).to.equal(
        translate('translations:summaryPageLabel')
      );
      expect(navItems[2].ariaLabel).to.equal(
        translate('translations:logoutPageLabel')
      );
    });
  });
});
