import {css, html} from 'lit-element';
import {i18nMixin, translate} from 'lit-element-i18n';
import {Router} from '@vaadin/router';

import '@thinkdeep/deep-footer';
import '@thinkdeep/deep-navbar';
import '@vaadin/vaadin-app-layout/vaadin-app-layout';
import '@vaadin/vaadin-app-layout/vaadin-drawer-toggle';
import '@vaadin/vaadin-tabs/vaadin-tab';
import '@vaadin/vaadin-tabs/vaadin-tabs';
import {DeepAuthService} from '@thinkdeep/deep-auth-service/deep-auth-service.js';

/* eslint-disable no-unused-vars */
export class DeepTemplateAnalyzer extends i18nMixin(DeepAuthService) {
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
    this.routes = [];
    this.location = Router.location;
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
        action: async () => {
          await import(
            '@thinkdeep/deep-template-analyzer/deep-analyzer-page-home.js'
          );
        },
      },
      {
        path: '/' + translate('translations:aboutPageLabel'),
        name: translate('translations:aboutPageLabel'),
        component: 'deep-analyzer-page-about',
        action: async () => {
          await import(
            '@thinkdeep/deep-template-analyzer/deep-analyzer-page-about.js'
          );
        },
      },
      {
        path: '(.*)',
        name: translate('translations:notFoundPageLabel'),
        component: 'deep-analyzer-page-not-found',
        action: async () => {
          await import(
            '@thinkdeep/deep-template-analyzer/deep-analyzer-page-not-found.js'
          );
        },
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
          grid-template-areas: 'content';
          background-color: var(--primary-color, #a4a4a4);
        }

        #content {
          grid-area: content;
        }
      `,
    ];
  }

  render() {
    return html`
      ${this.styles}

      <vaadin-app-layout>
        <vaadin-drawer-toggle
          slot="navbar"
          touch-optimized
        ></vaadin-drawer-toggle>
        <h1 slot="navbar" touch-optimized>${this.companyName}</h1>
        <vaadin-tabs slot="drawer" orientation="vertical">
          <vaadin-tab> ${this.user?.name} </vaadin-tab>
          ${this._toTabs(this.routes)}
          <vaadin-tab ?disabled="${!!this.user}" @click="${this.login}">
            <a> ${translate('translations:loginPageLabel')} </a>
          </vaadin-tab>
          <vaadin-tab ?disabled="${!this.user}" @click="${this.logout}">
            <a> ${translate('translations:logoutPageLabel')} </a>
          </vaadin-tab>
        </vaadin-tabs>

        <main id="content"></main>
      </vaadin-app-layout>
    `;
  }

  /**
   * Convert routes to tab markup.
   *
   * @param {Array} routes - Routes to convert.
   * @return {Array} - Tab templates.
   */
  _toTabs(routes) {
    return routes.map((route) =>
      route.hidden
        ? html``
        : html`
            <vaadin-tab>
              <a href="${route.path}"> ${route.name} </a>
            </vaadin-tab>
          `
    );
  }
}

customElements.define('deep-template-analyzer', DeepTemplateAnalyzer);
