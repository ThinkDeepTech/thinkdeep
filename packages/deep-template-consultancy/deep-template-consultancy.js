import { css, html, LitElement } from 'lit-element';

import '@thinkdeep/deep-footer';
import '@thinkdeep/deep-navbar';
import { Router } from '@vaadin/router';

import '@thinkdeep/deep-template-consultancy/deep-consultancy-page-home.js';
import '@thinkdeep/deep-template-consultancy/deep-consultancy-page-about.js';
import '@thinkdeep/deep-template-consultancy/deep-consultancy-page-not-found.js';

/* eslint-disable no-unused-vars */
export class DeepTemplateConsultancy extends LitElement {
  static get properties() {
    return {
      companyName: { type: String },
      address: { type: Object },
      routes: { type: Array },
      location: { type: Object },
    };
  }

  constructor() {
    super();

    this.companyName = 'Thinkdeep';
    this.address = {
      streetNumber: 349,
      streetName: 'Oliver Street',
      cityName: 'Forliven',
      provinceCode: 'ON',
      countryName: 'Canada',
      zipCode: 'N5A 7S1',
    };
    this.location = Router.location;
    this.routes = [
      {
        path: '/',
        name: 'home',
        component: 'deep-consultancy-page-home',
      },
      {
        path: '/about',
        name: 'about',
        component: 'deep-consultancy-page-about',
      },
      {
        path: '(.*)',
        name: 'page-not-found',
        component: 'deep-consultancy-page-not-found',
        hidden: true,
      },
    ];
  }

  firstUpdated() {
    super.firstUpdated();

    const targetViewingArea = this.shadowRoot.getElementById('content');
    const router = new Router(targetViewingArea);
    const routes = this.routes;
    router.setRoutes(routes);
  }

  static get styles() {
    return [
      css`
        :host {
          display: grid;
          grid-template-rows: repeat(6, 1fr);
          grid-template-areas:
            'header'
            'content'
            'content'
            'content'
            'content'
            'footer';
        }

        deep-navbar {
          background-color: var(--primary-color, #90a4ae);
          grid-area: header;
        }

        #content {
          grid-area: content;
          background-color: var(--secondary-color, #eceff1); // TODO: Implement fallback colors;
        }

        deep-footer {
          grid-area: footer;
        }
      `,
    ];
  }

  render() {
    return html`
      ${this.styles}

      <deep-navbar
        class="navbar"
        logo="./img/electrum-dark-icon.svg"
        .routes="${this.routes}"
      ></deep-navbar>

      <main id="content"></main>

      <!-- TODO: Separation of concerns -->
      <deep-footer>
        <div slot="helpful-links">
          <ul>
            ${this.routes.map((route) =>
              route.hidden ? html`` : html`<li><a href="${route.path}">${route.name}</a></li>`
            )}
          </ul>
        </div>
        <div slot="address">
          <p>
            We're located at <br />
            ${this.address.streetNumber} ${this.address.streetName}, ${this.address.cityName},
            ${this.address.provinceCode}, ${this.address.countryName} ${this.address.zipCode}
          </p>
        </div>
        <div slot="copyright">
          ${this.companyName.length > 0
            ? '\u00A9' + this.companyName + ', ' + new Date().getFullYear()
            : ''}.
        </div>
      </deep-footer>
    `;
  }
}

customElements.define('deep-template-consultancy', DeepTemplateConsultancy);
