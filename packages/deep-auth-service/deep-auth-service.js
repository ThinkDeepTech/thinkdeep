import {html, LitElement} from 'lit-element';
import createAuth0Client from '@auth0/auth0-spa-js';
import authConfig from './auth0_config';

export class DeepAuthService extends LitElement {
  static get properties() {
    return {
      auth: {type: Object},
    };
  }

  constructor() {
    super();
    this.auth = {};
  }

  async firstUpdated() {
    this.auth = await createAuth0Client({
      domain: authConfig.domain,
      client_id: authConfig.clientId,
    });
  }

  render() {
    return html``;
  }
}
customElements.define('deep-auth-service', DeepAuthService);
