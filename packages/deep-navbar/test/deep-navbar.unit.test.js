import {html, litFixtureSync, expect} from '@open-wc/testing';
import '@thinkdeep/deep-navbar/deep-navbar';

const visibleRoutes = [
  {
    path: '/',
    name: 'home',
    component: 'deep-consultancy-page-home',
  },
  {
    path: '/about',
    name: 'about',
    component: 'deep-consultancy-page-about',
  },
  {
    path: '/something',
    name: 'something',
    component: 'girbles',
    hidden: false,
  },
];

const hiddenRoutes = [
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

const routes = visibleRoutes.concat(hiddenRoutes);

describe('deep-navbar', () => {
  it('should hide navbar items labelled with hidden = true', async () => {
    const element = await litFixtureSync(
      html` <deep-navbar .routes=${routes}></deep-navbar> `
    );
    const menuItems =
      element?.shadowRoot?.querySelectorAll('deep-navlink') || [];
    expect(menuItems.length).to.equal(visibleRoutes.length);
  });

  it('should default to using the company name in the logo when not slotted', async () => {
    const companyName = 'Thinkdeep';
    const element = await litFixtureSync(
      html` <deep-navbar .companyName="${companyName}"></deep-navbar> `
    );
    const logo = element?.shadowRoot?.querySelector('slot[name="logo"]');
    expect(logo.innerHTML).to.contain(companyName);
  });

  describe('_visibleMenuItems', () => {
    it('should not include hidden routes', async () => {
      const element = await litFixtureSync(
        html` <deep-navbar .routes=${routes}></deep-navbar> `
      );
      const visibleMenuItems =
        element.shadowRoot.querySelectorAll('deep-navlink');
      expect(visibleMenuItems.length).to.equal(visibleRoutes.length);
    });

    it('should correctly order the routes for display', async () => {
      const element = await litFixtureSync(
        html` <deep-navbar .routes=${routes}></deep-navbar> `
      );
      const visibleMenuItems =
        element.shadowRoot.querySelectorAll('deep-navlink');

      for (let i = 0; i < visibleMenuItems.length; i++) {
        const menuItem = visibleMenuItems[i];
        const container = menuItem.shadowRoot.querySelector('p');
        const route = routes[i];
        expect(container.innerHTML).to.contain(route.name);
      }

      expect(visibleMenuItems.length).to.be.greaterThan(0);
    });
  });
});
