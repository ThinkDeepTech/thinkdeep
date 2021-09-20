import {css, html, LitElement} from 'lit-element';
import {i18nMixin} from 'lit-element-i18n';

import '@thinkdeep/deep-footer';
import '@thinkdeep/deep-navbar';
import {Router} from '@vaadin/router';

import '@thinkdeep/deep-template-analyzer/deep-analyzer-page-home.js';
import '@thinkdeep/deep-template-analyzer/deep-analyzer-page-about.js';
import '@thinkdeep/deep-template-analyzer/deep-analyzer-page-not-found.js';

/* eslint-disable no-unused-vars */
export class DeepTemplateAnalyzer extends i18nMixin(LitElement) {
  static get properties() {
    return {
      companyName: {type: String},
      address: {type: Object},
      routes: {type: Array},
      location: {type: Object},
    };
  }

  constructor() {
    super();

    this.companyName = 'ACME';
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
        name: 'Home',
        component: 'deep-analyzer-page-home',
      },
      {
        path: '/About',
        name: 'About',
        component: 'deep-analyzer-page-about',
      },
      {
        path: '(.*)',
        name: 'Page Not Found',
        component: 'deep-analyzer-page-not-found',
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
          grid-template-rows: auto 1fr auto;
          grid-template-areas:
            'header'
            'content'
            'footer';
          background-color: var(--primary-color, #000000);
        }

        deep-navbar {
          grid-area: header;
          height: 16vh;
        }

        #content {
          grid-area: content;
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
        .companyName="${this.companyName}"
        .routes="${this.routes}"
      ></deep-navbar>

      <main id="content"></main>

      <deep-footer
        .routes="${this.routes}"
        .address="${this.address}"
        .companyName="${this.companyName}"
      ></deep-footer>
    `;
  }
}

customElements.define('deep-template-analyzer', DeepTemplateAnalyzer);
