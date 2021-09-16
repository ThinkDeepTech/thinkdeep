import { html, litFixtureSync, expect } from '@open-wc/testing';
import '@thinkdeep/deep-navbar/deep-navbar';

const routes = [
  {
    path: '/',
    name: 'home',
    component: 'deep-consultancy-page-home',
  },
  {
    path: '/about',
    name: 'about',
    component: 'deep-consultancy-page-about',
    hidden: undefined,
  },
  {
    path: '(.*)',
    name: 'page-not-found',
    component: 'deep-consultancy-page-not-found',
    hidden: true,
  },
  {
    path: '/magical-stuff',
    name: 'page-magical-stuff',
    component: 'deep-consultancy-page-not-found',
    hidden: true,
  },
];

describe('deep-navbar', () => {
  it('should display menu items with falsy hidden property', async () => {
    const element = await litFixtureSync(html` <deep-navbar .routes=${routes}></deep-navbar> `);
    const menuItems = element?.shadowRoot?.querySelectorAll('a:not([hidden])') || [];

    // For each displaying menu item, find its route and verify that its not hidden
    for (const menuItem of menuItems)
      for (const route of routes)
        if (menuItem.getAttribute('href').toLowerCase() === route.path.toLowerCase())
          expect(!!route.hidden).to.equal(false);

    expect(menuItems.length).to.be.greaterThanOrEqual(1);
  });

  it('should hide navbar items labelled with hidden = true', async () => {
    const element = await litFixtureSync(html` <deep-navbar .routes=${routes}></deep-navbar> `);
    const menuItems = element?.shadowRoot?.querySelectorAll('a:not([hidden])') || [];
    let numHiddenLinks = 0;
    for (const route of routes) if (route.hidden) numHiddenLinks += 1;
    expect(menuItems.length).to.equal(routes.length - numHiddenLinks);
  });

  it('should default to using the company name in the logo when not slotted', async () => {
    const companyName = 'Thinkdeep';
    const element = await litFixtureSync(
      html` <deep-navbar .companyName="${companyName}"></deep-navbar> `
    );
    const logo = element?.shadowRoot?.querySelector('slot[name="logo"]');
    expect(logo.innerHTML).to.contain(companyName);
  });
});
