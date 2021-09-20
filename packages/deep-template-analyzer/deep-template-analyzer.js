import {css, html, LitElement} from 'lit-element';
import {i18nMixin, translate} from 'lit-element-i18n';

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

    this.companyName = '';
    this.address = {};
    this.location = Router.location;
    this.routes = [];
  }

  async firstUpdated() {
    super.firstUpdated();

    this.i18nInit();

    const languageUs = await import(
      './locales/en-US/deep-template-analyzer.mjs'
    );
    const languageCa = await import(
      './locales/en-CA/deep-template-analyzer.mjs'
    );

    this.addResources('en-US', 'translations', languageUs.default);
    this.addResources('en-CA', 'translations', languageCa.default);

    this.companyName = translate('translations:companyName');
    this.address = {
      streetNumber: translate('translations:companyStreetNumber'),
      streetName: translate('translations:companyStreetName'),
      cityName: translate('translations:companyCityName'),
      provinceCode: translate('translations:companyProvinceCode'),
      countryName: translate('translations:companyCountryName'),
      zipCode: translate('translations:companyZipCode'),
    };
    this.routes = [
      {
        path: '/',
        name: translate('translations:homePageLabel'),
        component: 'deep-analyzer-page-home',
      },
      {
        path: '/' + translate('translations:aboutPageLabel'),
        name: translate('translations:aboutPageLabel'),
        component: 'deep-analyzer-page-about',
      },
      {
        path: '(.*)',
        name: 'Page Not Found',
        component: 'deep-analyzer-page-not-found',
        hidden: true,
      },
    ];

    const targetViewingArea = this.shadowRoot.getElementById('content');
    const router = new Router(targetViewingArea);
    router.setRoutes(this.routes);
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
