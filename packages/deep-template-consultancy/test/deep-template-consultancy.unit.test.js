import {
  html,
  litFixtureSync,
  elementUpdated,
  expect,
  assert,
} from '@open-wc/testing';
import '@thinkdeep/deep-template-consultancy/deep-template-consultancy.js';
import {Router} from '@vaadin/router';

/**
 * Find the matching routing component.
 * @param {Object[]} routes - Route array used to represent routes.
 * @param {String} pageName - Page name for which the route will be returned.
 * @return - Route object.
 */
function findRoute(routes, pageName) {
  var target = null;
  for (const route of routes)
    if (route.name.toLowerCase().includes(pageName.toLowerCase()))
      target = route;
  return target;
}

/**
 * Click on the passed menu item
 * @param {HTMLElement} element - Navbar on which the links are included.
 * @param {Object} - Route object used by @vaadin/router
 */
function clickMenuItem(element, route) {
  var navlinks = element.shadowRoot.querySelectorAll('deep-navlink');
  for (const navlink of navlinks)
    if (navlink.route.path === route.path) navlink.click();
}

/**
 * Find a nested page element.
 * @param {HTMLElement} element - Page content element in which to locate page components.
 * @param {String} pageTagName - Name of the page being fetched.
 */
function findPage(element, pageTagName) {
  const pageComponents = element.querySelectorAll('*');

  var target = {};
  for (const page of pageComponents)
    if (
      page?.tagName?.toLowerCase &&
      pageTagName &&
      page.tagName.toLowerCase() === pageTagName.toLowerCase()
    )
      target = page;

  return target;
}

/**
 * Sleep for the specified number of milliseconds.
 * @param {Number} milliseconds
 */
function sleep(milliseconds) {
  return new Promise((r) => setTimeout(r, milliseconds));
}

describe('deep-template-consultancy', () => {
  let element, homeRoute, navbar;
  beforeEach(async () => {
    element = await litFixtureSync(
      html`<deep-template-consultancy></deep-template-consultancy>`
    );
    await elementUpdated(element);
    await new Promise((r) => setTimeout(r, 5000));

    homeRoute = findRoute(element.routes, 'home');
    navbar = element.shadowRoot.querySelector('deep-navbar');
  });

  it('should include a navbar at the top of the page', () => {
    const target = element.shadowRoot.querySelectorAll('deep-navbar');
    expect(target.length).to.equal(1);
  });

  it('should include a footer at the bottom of the page', () => {
    const target = element.shadowRoot.querySelectorAll('deep-footer');
    expect(target.length).to.equal(1);
  });

  it('should update the main window when a menu item is clicked', async () => {
    const contentArea = element.shadowRoot.getElementById('content');

    await elementUpdated(contentArea);

    clickMenuItem(navbar, homeRoute);
    await elementUpdated(contentArea);
    const homePage = findPage(contentArea, homeRoute.component);

    const initialTextContent = homePage?.shadowRoot?.textContent;
    if (initialTextContent === undefined)
      assert.fail('Initial text content was undefined.');

    const aboutRoute = findRoute(element.routes, 'about');
    clickMenuItem(navbar, aboutRoute);

    await elementUpdated(contentArea);
    const aboutPage = findPage(contentArea, aboutRoute.component);
    const alteredTextContent = aboutPage?.shadowRoot?.textContent;
    if (alteredTextContent === undefined)
      assert.fail('Altered text content was undefined.');

    expect(initialTextContent).not.to.equal(alteredTextContent);
  });

  it('should navigate to the 404 not found page if an unknown page is requested', async () => {
    const contentArea = element.shadowRoot.getElementById('content');
    const notFoundPage = findRoute(element.routes, 'Page Not Found');
    Router.go('/doesntexist');
    await sleep(3000);
    await elementUpdated(element);

    let currentPage = findPage(contentArea, notFoundPage.component);
    const firstTextContent = currentPage?.shadowRoot?.textContent;

    expect(firstTextContent).to.contain('Page Not Found');

    Router.go('/anotherunknownpath');
    await sleep(3000);
    await elementUpdated(element);

    currentPage = findPage(contentArea, notFoundPage.component);
    const secondTextContent = currentPage?.shadowRoot?.textContent;
    expect(firstTextContent).to.equal(secondTextContent);

    Router.go('Home');
  });
});
