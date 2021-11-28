import {html, litFixtureSync, expect} from '@open-wc/testing';
import '@thinkdeep/deep-footer/deep-footer.js';

describe('footer', () => {
  const companyName = 'Thinkdeep';
  const routes = [
    {name: 'home', path: '/'},
    {name: 'about', path: '/about'},
    {name: 'contact', path: '/contact'},
  ];
  const address = {
    streetNumber: 59,
    streetName: 'Wikamore Street',
    cityName: 'Chandougal',
    provinceCode: 'ON',
    countryName: 'Canada',
    zipCode: 'N5A7S1',
  };

  let element;
  beforeEach(async () => {
    element = await litFixtureSync(html`
      <deep-footer
        .companyName=${companyName}
        .routes=${routes}
        .address=${address}
      >
      </deep-footer>
    `);
  });

  it('should include standard page links in helpful-links', () => {
    const section = element.shadowRoot.querySelector('.helpful-links');
    const links = section.querySelectorAll('a');

    const visibleRoutes = [];
    const actualRoutes = element.routes;
    for (const i in actualRoutes)
      if (!actualRoutes[i].hidden) visibleRoutes.push(actualRoutes[i]);

    expect(links.length).to.equal(visibleRoutes.length);
  });

  it('should list the address', () => {
    const actualAddress = element.shadowRoot.querySelector('.address');

    expect(actualAddress.textContent).to.contain(element.address.streetNumber);
    expect(actualAddress.textContent).to.contain(element.address.streetName);
    expect(actualAddress.textContent).to.contain(element.address.cityName);
    expect(actualAddress.textContent).to.contain(element.address.provinceCode);
    expect(actualAddress.textContent).to.contain(element.address.countryName);
    expect(actualAddress.textContent).to.contain(element.address.zipCode);
  });

  it('should include copywrite information', async () => {
    const section = element.shadowRoot.querySelector('.copyright');
    expect(section.textContent).to.contain('\u00A9');
  });
});
