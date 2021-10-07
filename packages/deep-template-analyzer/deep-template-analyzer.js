import {css, html, LitElement} from 'lit-element';
import {i18nMixin, translate} from 'lit-element-i18n';
import {Router} from '@vaadin/router';

import deepAuthMixin from '@thinkdeep/deep-auth-mixin/deep-auth-mixin';
import '@thinkdeep/deep-footer';
import '@thinkdeep/deep-navbar';
import '@vaadin/vaadin-app-layout/vaadin-app-layout';
import '@vaadin/vaadin-app-layout/vaadin-drawer-toggle';
// import '@vaadin/vaadin-icon/vaadin-icon';
import '@vaadin/vaadin-tabs/vaadin-tab';
import '@vaadin/vaadin-tabs/vaadin-tabs';

/* eslint-disable no-unused-vars */
export class DeepTemplateAnalyzer extends i18nMixin(deepAuthMixin(LitElement)) {
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
        icon: 'vaadin:home',
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
        icon: 'vaadin:deindent',
      },
      {
        path: '/' + translate('translations:loginPageLabel'),
        name: translate('translations:loginPageLabel'),
        component: 'deep-analyzer-page-login',
        action: async () => {
          await import(
            '@thinkdeep/deep-template-analyzer/deep-analyzer-page-login.js'
          );
          await this.auth.loginWithRedirect();
        },
        icon: 'vaadin:user',
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
          background-color: var(--primary-color, #a4a4a4);
        }

        vaadin-app-layout {
          --vaadin-app-layout-drawer-overlay: true;
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
        <vaadin-tabs orientation="vertical" slot="drawer">
          ${this._routes()}
        </vaadin-tabs>

        <main id="content"></main>
      </vaadin-app-layout>
    `;
  }

  /**
   * Get the markup for the routes.
   */
  _routes() {
    return this.routes.map((route) =>
      route.hidden
        ? html``
        : html`
            <vaadin-tab>
              <a tabindex="-1" href="${route.path}">
                <vaadin-icon icon="${route.icon}"></vaadin-icon>
                <span>${route.name}</span>
              </a>
            </vaadin-tab>
          `
    );
  }
}

customElements.define('deep-template-analyzer', DeepTemplateAnalyzer);
