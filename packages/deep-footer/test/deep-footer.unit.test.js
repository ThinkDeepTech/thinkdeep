import { html, litFixtureSync, expect } from '@open-wc/testing';
import '@thinkdeep/deep-footer/deep-footer.js';

describe('deep-footer', () => {
  let element;
  beforeEach(async () => {
    element = await litFixtureSync(html`<deep-footer></deep-footer>`);
  });

  it('should include copywrite date', () => {
    const copywrite = element.shadowRoot.querySelector('.copyright');
    expect(copywrite.textContent).to.contain('\u00A9');
  });
});
