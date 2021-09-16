import { litFixtureSync, html } from '@open-wc/testing-helpers';
import '@thinkdeep/deep-footer/deep-footer.js';

describe('footer', () => {
  let element;
  beforeEach(async () => {
    element = await litFixtureSync(html`
      <deep-footer
        .companyName="Thinkdeep"
        .routes="[{'name': 'home', 'path': '/'}, {'name': 'about', 'path': '/about'}, {'name': 'contact', 'path': 'contact'}]"
        .address="{'streetNumber': '59', 'streetName': 'Wikamore Street', 'cityName': 'Chandougal', 'provinceName': 'ON', 'countryName': 'Canada', 'zipCode': 'N5A 7S1'}"
      >
      </deep-footer>
    `);
  });

  it('should include standard page links in helpful-links', () => {
    const section = element.shadowRoot.querySelector('.helpful-links');
    const links = section.querySelectorAll('a');

    const visibleRoutes = [];
    const routes = element.routes;
    for (const i in routes) if (!routes[i].hidden) visibleRoutes.push(routes[i]);

    expect(links.length).to.equal(visibleRoutes.length);
  });

  it('should list the address', () => {
    const address = element.shadowRoot.querySelector('.address');

    expect(address.textContent).to.contain(element.address.streetNumber);
    expect(address.textContent).to.contain(element.address.streetName);
    expect(address.textContent).to.contain(element.address.cityName);
    expect(address.textContent).to.contain(element.address.provinceCode);
    expect(address.textContent).to.contain(element.address.countryName);
    expect(address.textContent).to.contain(element.address.zipCode);
  });

  it('should include copywrite information', async () => {
    const section = element.shadowRoot.querySelector('.copyright');
    expect(section.textContent).to.contain('\u00A9');
  });
});
