import {css, html, LitElement} from 'lit-element';
import {i18nMixin, translate} from 'lit-element-i18n';
import {Router} from '@vaadin/router';

import '@thinkdeep/deep-footer';
import '@thinkdeep/deep-navbar';
import '@vaadin/vaadin-app-layout/vaadin-app-layout';
import '@vaadin/vaadin-app-layout/vaadin-drawer-toggle';
import '@vaadin/vaadin-tabs/vaadin-tab';
import '@vaadin/vaadin-tabs/vaadin-tabs';

import {getUser} from '@thinkdeep/deep-template-analyzer/user.mjs';
import {initApolloClient} from './graphql/client.mjs';

// TODO: Update readme with self-signed ssl cert requirements

/* eslint-disable no-unused-vars */
export class DeepTemplateAnalyzer extends i18nMixin(LitElement) {
  static get properties() {
    return {
      companyName: {type: String},
      address: {type: Object},
      routes: {type: Array},
      location: {type: Object},
      user: {type: Object},
    };
  }

  constructor() {
    super();
    this.companyName = '';
    this.address = {};
    this.routes = [];
    this.location = Router.location;
    this.user = {};
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
        path: `/${translate('translations:summaryPageLabel')}`,
        name: translate('translations:summaryPageLabel'),
        component: 'deep-analyzer-page-summary',
        action: async () => {
          await import(
            '@thinkdeep/deep-template-analyzer/deep-analyzer-page-summary'
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
        // TODO: Replacement for hidden included in vaadin? I think I can remember seeing one.
        hidden: true,
      },
    ];

    const targetViewingArea = this.shadowRoot.getElementById('content');
    const router = new Router(targetViewingArea);
    router.setRoutes(this.routes);

    this.user = await getUser();
    await initApolloClient();
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
          ${this.routes.map((route) =>
            route.hidden
              ? html``
              : html`
                  <vaadin-tab>
                    <a href="${route.path}"> ${route.name} </a>
                  </vaadin-tab>
                `
          )}
          ${!this.user.loggedIn
            ? html` <vaadin-tab @click="${this.user.login}">
                <a> ${translate('translations:loginPageLabel')} </a>
              </vaadin-tab>`
            : html`
                <vaadin-tab @click="${this.user.logout}">
                  <a> ${translate('translations:logoutPageLabel')} </a>
                </vaadin-tab>
              `}
        </vaadin-tabs>

        <main id="content"></main>
      </vaadin-app-layout>
    `;
  }
}

customElements.define('deep-template-analyzer', DeepTemplateAnalyzer);
