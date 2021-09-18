import { html, litFixtureSync, expect } from '@open-wc/testing';
import '@thinkdeep/deep-navlink/deep-navlink';

describe('deep-navlink', () => {
  const route = {
    path: '/',
    name: 'home',
    component: 'something-here',
  };

  const emptyRoute = {};

  it('should be wrapped in a paragraph tag for positioning purposes', async () => {
    // NOTE: In order to move the text in the link a paragraph tag was necessary.
    const element = await litFixtureSync(html` <deep-navlink .route="${route}"></deep-navlink> `);
    expect(element.shadowRoot.querySelectorAll('p')).not.to.equal(undefined);
  });

  it('should display nothing if route is empty', async () => {
    const element = await litFixtureSync(html`
      <deep-navlink .route="${emptyRoute}"></deep-navlink>
    `);
    expect(element.shadowRoot.childNodes.length).to.equal(0);
  });

  it('should display a link', async () => {
    const element = await litFixtureSync(html` <deep-navlink .route="${route}"></deep-navlink> `);
    const link = element.shadowRoot.querySelector('a');
    const path = link?.href?.split('/')[3];

    expect(path).to.equal('');
    expect(link.textContent).to.contain(route.name);
  });
});
