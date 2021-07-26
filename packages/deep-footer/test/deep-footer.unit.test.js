import { html, litFixtureSync, expect } from '@open-wc/testing';
import '@thinkdeep/deep-footer/deep-footer.js';

describe('deep-footer', () => {
  const filledCompanyName = 'Sample Company Name';
  it('should include copywrite date', async () => {
    const element = await litFixtureSync(
      html`<deep-footer company="${filledCompanyName}"></deep-footer>`
    );
    const copyright = element.shadowRoot.querySelector('.copyright');
    expect(copyright.textContent).to.contain('\u00A9');
  });

  it('should display copyright information if the user sets company name', async () => {
    const element = await litFixtureSync(
      html`<deep-footer company="${filledCompanyName}"></deep-footer>`
    );
    const copyright = element.shadowRoot.querySelector('.copyright');
    expect(copyright.textContent).to.contain(filledCompanyName);
  });

  it("should hide the copyright if a company name isn't provided", async () => {
    const element = await litFixtureSync(html`<deep-footer company=""></deep-footer>`);
    const copyright = element.shadowRoot.querySelector('.copyright');
    expect(copyright.textContent).not.to.contain('\u00A9');
  });
});
