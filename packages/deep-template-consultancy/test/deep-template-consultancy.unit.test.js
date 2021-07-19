import { html, litFixtureSync, elementUpdated, expect, assert } from '@open-wc/testing';
import '@thinkdeep/deep-template-consultancy/deep-template-consultancy.js';

/**
 * Find the matching routing component.
 * @param {Object[]} routes - Route array used to represent routes.
 * @param {String} pageName - Page name for which the route will be returned.
 * @return - Route object.
 */
function findRoute(routes, pageName) {
  var target = null;
  for (const route of routes) if (route.name.includes(pageName)) target = route;
  return target;
}

/**
 * Click on the passed menu item
 * @param {HTMLElement} element - Navbar on which the links are included.
 * @param {Object} - Route object used by @vaadin/router
 */
function clickMenuItem(element, route) {
  var menuItems = element.shadowRoot.querySelectorAll('a');
  for (const menuItem of menuItems)
    if (menuItem.getAttribute('href') === route.path) menuItem.click();
}

/**
 * Find a nested page element.
 * @param {HTMLElement} - Page content element in which to locate page components.
 * @param {String} - Name of the page being fetched.
 */
function findPage(element, pageTagName) {
  const pageComponents = element.querySelectorAll('*');

  var target = {};
  for (const page of pageComponents)
    if (
      page?.tagName?.toLowerCase &&
      page.tagName &&
      pageTagName &&
      page.tagName.toLowerCase() === pageTagName.toLowerCase()
    )
      target = page;

  return target;
}

describe('deep-template-consultancy', () => {
  let element;
  beforeEach(async () => {
    element = await litFixtureSync(html`<deep-template-consultancy></deep-template-consultancy>`);
  });

  it('should include the home route as /', () => {
    var target = findRoute(element.routes, 'home');
    expect(target.path).to.equal('/');
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

    const homeRoute = findRoute(element.routes, 'home');
    const navbar = element.shadowRoot.querySelector('deep-navbar');
    clickMenuItem(navbar, homeRoute);
    elementUpdated(contentArea).then((additionalUpdatesNeeded) => {
      const homePage = findPage(contentArea, homeRoute.component);
      const initialTextContent = homePage.shadowRoot.textContent;

      const aboutRoute = findRoute(element.routes, 'about');
      clickMenuItem(navbar, aboutRoute);
      elementUpdated(contentArea).then((additionalUpdatesNeeded) => {
        const aboutPage = findPage(contentArea, aboutRoute.component);
        const alteredTextContent = aboutPage.shadowRoot.textContent;

        expect(initialTextContent).not.to.equal(alteredTextContent);
      });
    });
  });

  it('should navigate to the 404 not found page if an unknown page is requested', async () => {
    const contentArea = element.shadowRoot.getElementById('content');
    const notFoundPage = findRoute(element.routes, 'page-not-found');
    const newLocation = Location.href + '/somethingentirelyrandom';
    Location.href = newLocation;
    elementUpdated(contentArea).then((additionalUpdatesNeeded) => {
      const currentPage = findPage(contentArea, notFoundPage.component);
      const alteredTextContent = currentPage?.shadowRoot?.textContent;

      if (alteredTextContent === undefined)
        assert.fail(
          'The page that was returned was not the expected 404 not found page. It was undefined.'
        );

      expect(alteredTextContent).to.include(
        "We couldn't find what you were looking for. Are you sure the URL is correct?"
      );
    });
  });
});
