import '@material/mwc-icon-button';
import '@material/mwc-top-app-bar-fixed';
import '@thinkdeep/deep-footer';
import {Router} from '@vaadin/router';
import {css, html, LitElement} from 'lit';
import {i18nMixin, translate} from 'lit-element-i18n';

import {getUser} from '@thinkdeep/deep-template-analyzer/user.mjs';
import {initApolloClient} from './graphql/client.mjs';

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
        path: `/${translate('translations:loginPageLabel')}`,
        name: translate('translations:loginPageLabel'),
        component: 'deep-analyzer-page-home',
        action: async () => {
          await this.user.login();
        },
      },
      {
        path: `/${translate('translations:logoutPageLabel')}`,
        name: translate('translations:logoutPageLabel'),
        component: 'deep-analyzer-page-home',
        action: async () => {
          await this.user.logout();
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
          grid-template-rows: 10vh 1fr auto;
          grid-template-areas:
            'header'
            'content'
            'footer';
        }

        mwc-top-app-bar-fixed {
          grid-area: header;
          height: 10vh;
          --mdc-theme-primary: var(--primary-color);
          --mdc-theme-on-primary: white;
        }

        #content {
          grid-area: content;
          min-height: 80vh;
          color: var(--primary-color);
        }

        deep-footer {
          grid-area: footer;
          background-color: var(--primary-color);
          color: white;
        }
      `,
    ];
  }

  render() {
    return html`
      ${this.styles}

      <mwc-top-app-bar-fixed>
        <div slot="title">${this.companyName}</div>

        <mwc-icon-button
          icon="home"
          slot="actionItems"
          @click="${() => Router.go('/')}"
          aria-label="Home"
        ></mwc-icon-button>
        <mwc-icon-button
          icon="space_dashboard"
          slot="actionItems"
          @click="${() =>
            Router.go(translate('translations:summaryPageLabel'))}"
          aria-label="summary"
        ></mwc-icon-button>

        ${this.user.loggedIn
          ? html`
              <mwc-icon-button
                icon="logout"
                slot="actionItems"
                @click="${() =>
                  Router.go(translate('translations:logoutPageLabel'))}"
                aria-label="logout"
              ></mwc-icon-button>
            `
          : html`
              <mwc-icon-button
                icon="login"
                slot="actionItems"
                @click="${() =>
                  Router.go(translate('translations:loginPageLabel'))}"
                aria-label="login"
              ></mwc-icon-button>
            `}
      </mwc-top-app-bar-fixed>

      <main id="content"></main>

      <deep-footer .companyName="${this.companyName}"></deep-footer>
    `;
  }
}

customElements.define('deep-template-analyzer', DeepTemplateAnalyzer);
