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
    this.routes = [
      {
        path: '/',
        name: translate('translations:routes.home'),
        component: 'deep-analyzer-page-home',
      },
      {
        path: '/About',
        name: translate('translations:routes.about'),
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

    this.i18nInit('deep-template-analyzer');
    this.addResources('en', 'translations', {
      companyName: 'ACME',
      companyStreetNumber: 349,
      companyStreetName: 'Oliver Street',
      companyCityName: 'Goutentok',
      companyProvinceCode: 'ON',
      companyCountryName: 'Canada',
      companyZipCode: 'N5A7S1',
      routeLabelHome: 'Home',
      routeLabelAbout: 'About',
    });

    this.companyName = translate('translations:companyName');
    this.routes = [
      {
        path: '/',
        name: translate('translations:routeLabelHome'),
        component: 'deep-analyzer-page-home',
      },
      {
        path: '/' + translate('translations:routeLabelAbout'),
        name: translate('translations:routeLabelAbout'),
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
