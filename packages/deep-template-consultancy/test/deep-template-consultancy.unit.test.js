import { html, fixture, expect } from '@open-wc/testing';
import '@thinkdeep/deep-template-consultancy/deep-template-consultancy.js';

describe('deep-template-consultancy', () => {
  it('should include a navigation bar', async () => {
    const element = await fixture(html`<deep-template-consultancy></deep-template-consultancy>`);
    // let element = stamp(html`<deep-template-consultancy></deep-template-consultancy>`);
    // let navbar = element.querySelectorAll('deep-navbar');
    // expect(navbar).not.to.equal(undefined);
    expect(element.routes.length).not.to.equal(0);
  });
});
