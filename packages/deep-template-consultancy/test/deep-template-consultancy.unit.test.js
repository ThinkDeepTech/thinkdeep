import { html, litFixtureSync, expect } from '@open-wc/testing';
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
// function clickMenuItem(element, route) {
//   var menuItems = element.shadowRoot.querySelectorAll('a');
//   for (const menuItem of menuItems)
//     if (menuItem.getAttribute('href').includes(route.path)) menuItem.click();
// }

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

  // it('should update the main window when a menu item is clicked', async () => {
  //   const contentArea = element.shadowRoot.getElementById('content');

  //   const homeRoute = findRoute(element.routes, 'home');
  //   const navbar = element.shadowRoot.querySelector('deep-navbar');
  //   clickMenuItem(navbar, homeRoute);
  //   await elementUpdated(contentArea);
  //   const initialTextContent = contentArea.textContent;

  //   const aboutRoute = findRoute(element.routes, 'about');
  //   clickMenuItem(navbar, aboutRoute);
  //   await elementUpdated(contentArea);
  //   const alteredTextContent = contentArea.textContent;

  //   expect(initialTextContent).not.to.equal(alteredTextContent);

  //   clickMenuItem(navbar, homeRoute);
  // });
});
