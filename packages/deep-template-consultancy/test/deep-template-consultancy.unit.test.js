import { html, fixture, expect } from '@open-wc/testing';
import '@thinkdeep/deep-template-consultancy/deep-template-consultancy.js';

/**
 * Find the matching routing component.
 */
function findRoute(routes, pageName) {
  var target = null;
  for (const route of routes) {
    if (route.name.includes(pageName)) target = route;
  }
  return target;
}

describe('deep-template-consultancy', () => {
  let element;
  beforeEach(async () => {
    element = await fixture(html`<deep-template-consultancy></deep-template-consultancy>`);
  });

  it('should include the home route as /', () => {
    var target = findRoute(element.routes, 'home');
    expect(target.path).to.equal('/');
  });

  it('should include a navbar at the top of the page', () => {
    const target = element.shadowRoot.querySelectorAll('deep-navbar');
    expect(target.length).to.equal(1);
  });
});
