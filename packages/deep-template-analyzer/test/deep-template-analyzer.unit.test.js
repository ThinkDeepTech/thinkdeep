import {
  html,
  litFixtureSync,
  elementUpdated,
  expect,
  assert,
} from '@open-wc/testing';
import '@thinkdeep/deep-template-analyzer/deep-template-analyzer.js';
import {sleep} from '@thinkdeep/tools/test-helper.mjs';
import {Router} from '@vaadin/router';
import {translate} from 'lit-element-i18n';

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
  var navlinks = element.querySelectorAll('vaadin-tab > a');
  for (const navlink of navlinks) {
    if (navlink.href.toLowerCase().includes(route.path.toLowerCase())) {
      navlink.click();
      break;
    }
  }
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

describe('deep-template-analyzer', function () {
  let element, homeRoute, navbar;
  beforeEach(async () => {
    element = await litFixtureSync(
      html`<deep-template-analyzer></deep-template-analyzer>`
    );
    await elementUpdated(element);
    await sleep(5000);

    homeRoute = findRoute(
      element.routes,
      translate('translations:homePageLabel')
    );
    navbar = element.shadowRoot.querySelector('[slot="drawer"]');
  });

  it('should update the main window when a menu item is clicked', async () => {
    const contentArea = element.shadowRoot.getElementById('content');

    await elementUpdated(contentArea);

    clickMenuItem(navbar, homeRoute);
    await sleep(2000);
    await elementUpdated(contentArea);
    const homePage = findPage(contentArea, homeRoute.component);

    const initialTextContent = homePage?.shadowRoot?.textContent;
    if (initialTextContent === undefined)
      assert.fail('Initial text content was undefined.');

    const aboutRoute = findRoute(
      element.routes,
      translate('translations:aboutPageLabel')
    );
    clickMenuItem(navbar, aboutRoute);
    await sleep(2000);
    await elementUpdated(contentArea);

    const aboutPage = findPage(contentArea, aboutRoute.component);
    const alteredTextContent = aboutPage?.shadowRoot?.textContent;
    if (alteredTextContent === undefined)
      assert.fail('Altered text content was undefined.');

    clickMenuItem(navbar, homeRoute);
    expect(initialTextContent).not.to.equal(alteredTextContent);
  });

  it('should navigate to the 404 not found page if an unknown page is requested', async () => {
    const contentArea = element.shadowRoot.getElementById('content');
    const notFoundPage = findRoute(
      element.routes,
      translate('translations:notFoundPageLabel')
    );

    Router.go('/doesntexist');
    await sleep(3000);
    await elementUpdated(element);

    let currentPage = findPage(contentArea, notFoundPage.component);
    const firstTextContent = currentPage?.shadowRoot?.textContent;

    expect(firstTextContent).to.contain(
      translate('translations:notFoundPageContent')
    );

    Router.go('/anotherunknownpath');
    await sleep(3000);
    await elementUpdated(element);

    currentPage = findPage(contentArea, notFoundPage.component);
    const secondTextContent = currentPage?.shadowRoot?.textContent;
    expect(firstTextContent).to.equal(secondTextContent);

    Router.go(translate('translations:homePageLabel'));
  });
});
