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

    this.companyName = '';
    this.address = {};
    this.location = Router.location;
    this.routes = [];
  }

  async firstUpdated() {
    super.firstUpdated();

    this.i18nInit(
      'translations',
      {
        'en-US': {
          translations: (await import('./locales/en-US/common.js')).default,
        },
        'en-CA': {
          translations: (await import('./locales/en-CA/common.js')).default,
        },
      },
      'translations'
    );

    this.companyName = this.translate('translations:companyName');
    this.address = {
      streetNumber: this.translate('translations:companyStreetNumber'),
      streetName: this.translate('translations:companyStreetName'),
      cityName: this.translate('translations:companyCityName'),
      provinceCode: this.translate('translations:companyProvinceCode'),
      countryName: this.translate('translations:companyCountryName'),
      zipCode: this.translate('translations:companyZipCode'),
    };
    this.routes = [
      {
        path: '/',
        name: this.translate('translations:homePageLabel'),
        component: 'deep-analyzer-page-home',
      },
      {
        path: '/' + this.translate('translations:aboutPageLabel'),
        name: this.translate('translations:aboutPageLabel'),
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
