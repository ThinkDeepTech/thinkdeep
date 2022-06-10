/* eslint-disable no-unused-vars */

import '@material/mwc-icon-button';
import '@material/mwc-top-app-bar-fixed';
import {Router} from '@vaadin/router';
import {css, html, LitElement} from 'lit';
import {i18nMixin, translate} from 'lit-element-i18n';

import {user, premium} from '@thinkdeep/deep-economic-analyzer/user.js';
import {initApolloClient} from './graphql/client.js';

/**
 * Lit component providing access to the economic analysis web application.
 */
export class DeepEconomicAnalyzer extends i18nMixin(LitElement) {
  /**
   * Lit component property definitions.
   */
  static get properties() {
    return {
      companyName: {type: String},

      /** Window location */
      location: {type: Object},

      user: {type: Object},

      /** Indicates whether the logged in user is a premium user */
      premiumAccount: {type: Boolean},
    };
  }

  /**
   * Lit component constructor.
   */
  constructor() {
    super();
    this.companyName = '';
    this.location = Router.location;
    this.user = {};
    this.premiumAccount = false;
  }

  /**
   * Lit callback executing when the page is first updated.
   */
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

    this.user = await user();
    this.premiumAccount = premium(this.user);
    await initApolloClient(this.user);

    const routes = [
      {
        path: '/',
        name: translate('translations:homePageLabel'),
        component: 'deep-analyzer-page-home',
        action: async () => {
          await import(
            '@thinkdeep/deep-economic-analyzer/deep-analyzer-page-home.js'
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
    ];

    if (this.user.loggedIn) {
      if (this.premiumAccount) {
        routes.push({
          path: `/${translate('translations:summaryPageLabel')}`,
          name: translate('translations:summaryPageLabel'),
          component: 'deep-analyzer-page-summary',
          action: async () => {
            await import(
              '@thinkdeep/deep-economic-analyzer/deep-analyzer-page-summary.js'
            );
          },
        });
      }

      routes.push({
        path: `/${translate('translations:logoutPageLabel')}`,
        name: translate('translations:logoutPageLabel'),
        component: 'deep-analyzer-page-home',
        action: async () => {
          await this.user.logout();
        },
      });
    }

    // NOTE: It appears that the vaadin router implements a sort of chain-of-responsibility in that it
    // checks each path to see if the windows location matches and, if it does, it routes to that page.
    // However, that means that all routes must be pushed before the not found page otherwise they'll
    // match with the not found page and ignore routing definitions that occur afterward.
    routes.push({
      path: '(.*)',
      name: translate('translations:notFoundPageLabel'),
      component: 'deep-analyzer-page-not-found',
      action: async () => {
        await import(
          '@thinkdeep/deep-economic-analyzer/deep-analyzer-page-not-found.js'
        );
      },
    });

    const targetViewingArea = this.shadowRoot.getElementById('content');
    const router = new Router(targetViewingArea);
    router.setRoutes(routes);
  }

  /**
   * Lit component styles definition.
   * @return {Array<TemplateResult>}
   */
  static get styles() {
    return [
      css`
        :host {
          display: block;
          height: 100vh;
          width: 100vw;
        }

        .grid-container {
          display: grid;
          grid-template-rows: auto 11fr;
          grid-template-areas:
            'header'
            'content';
        }

        mwc-top-app-bar-fixed {
          grid-area: header;
          --mdc-theme-primary: var(--primary-color);
          --mdc-theme-on-primary: var(--secondary-color);
          background-color: var(--primary-color);
        }

        #content {
          grid-area: content;
          color: var(--primary-color);
        }

        a {
          color: var(--primary-color-dark);
        }
      `,
    ];
  }

  /**
   * Lit component render function.
   * @return {TemplateResult}
   */
  render() {
    return html`
      ${this.styles}

      <div class="grid-container">
        <mwc-top-app-bar-fixed>
          <div slot="title">${this.companyName}</div>

          ${this.menuItems(this.user, this.premiumAccount)}
        </mwc-top-app-bar-fixed>

        <main id="content"></main>
      </div>
    `;
  }

  /**
   * Return the markup needed to render the menu items.
   *
   * @param {Object} usr Current user.
   * @param {Boolean} premiumAccount Whether the current user is a premium user.
   *
   * @return {TemplateResult} Template definining the menu items.
   */
  menuItems(usr, premiumAccount) {
    return html` <mwc-icon-button
        @click=${() => Router.go('/')}
        icon="home"
        aria-label="${translate('translations:homePageLabel')}"
        slot="actionItems"
      >
      </mwc-icon-button>

      ${usr && usr.loggedIn
        ? this.protectedMenuItems(premiumAccount)
        : this.standardMenuItems()}`;
  }

  /**
   * Get the markup for protected menu items.
   * @param {Boolean} premiumAccount Whether the current user is a premium user.
   * @return {TemplateResult} Template of the menu items.
   */
  protectedMenuItems(premiumAccount) {
    return html`
      ${premiumAccount ? this.premiumMenuItems() : ''}

      <mwc-icon-button
        @click="${() =>
          Router.go('/' + translate('translations:logoutPageLabel'))}"
        icon="logout"
        aria-label="${translate('translations:logoutPageLabel')}"
        slot="actionItems"
      >
      </mwc-icon-button>
    `;
  }

  /**
   * Get the markup for premium menu items.
   * @return {TemplateResult} Template containing menu items.
   */
  premiumMenuItems() {
    return html`
      <mwc-icon-button
        @click=${() =>
          Router.go('/' + translate('translations:summaryPageLabel'))}
        icon="space_dashboard"
        aria-label="${translate('translations:summaryPageLabel')}"
        slot="actionItems"
      >
      </mwc-icon-button>
    `;
  }

  /**
   * Get the markup for standard menu items.
   * @return {TemplateResult} Template containing menu items.
   */
  standardMenuItems() {
    return html`
      <mwc-icon-button
        @click="${() =>
          Router.go('/' + translate('translations:loginPageLabel'))}"
        icon="login"
        aria-label="${translate('translations:loginPageLabel')}"
        slot="actionItems"
      >
      </mwc-icon-button>
    `;
  }
}

customElements.define('deep-economic-analyzer', DeepEconomicAnalyzer);
