import {html, LitElement} from 'lit-element';
import createAuth0Client from '@auth0/auth0-spa-js';
import authConfig from './auth0_config';

export class DeepAuthService extends LitElement {
  static get properties() {
    return {
      user: {type: Object},
      _auth0: {type: Object},
    };
  }

  constructor() {
    super();
    this.user = {};
  }

  async firstUpdated() {
    this._auth0 = await createAuth0Client({
      domain: authConfig.domain,
      client_id: authConfig.clientId,
      redirect_uri: globalThis.location.origin,
      useRefreshTokens: true,
      cacheLocation: 'localstorage',
    });

    const auth0 = this._auth0;

    const isAuthenticated = await auth0.isAuthenticated();
    const query = globalThis.location.search || '';
    if (
      !isAuthenticated &&
      query.includes('code=') &&
      query.includes('state=')
    ) {
      // Parse auth info in url
      await auth0.handleRedirectCallback();

      // Remove query from url
      globalThis.history.replaceState({}, document.title, '/');
    }

    this.user = await auth0.getUser();
  }

  render() {
    return html``;
  }

  /**
   * Show the login window.
   * @return {Promise} Resolves on completion of login.
   */
  async login() {
    await this._auth0.loginWithRedirect();
  }

  /**
   * Log the user out.
   */
  async logout() {
    await this._auth0.logout({
      returnTo: globalThis.location.origin,
    });
  }
}
customElements.define('deep-auth-service', DeepAuthService);