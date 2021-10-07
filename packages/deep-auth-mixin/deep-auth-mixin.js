import createAuth0Client from '@auth0/auth0-spa-js';
import authConfig from './auth0_config';
// import Auth0Lock from 'auth0-lock';

const deepAuthMixin = (baseClass) =>
  class extends baseClass {
    constructor() {
      super();

      createAuth0Client({
        domain: authConfig.domain,
        client_id: authConfig.clientId,
        redirect_uri: authConfig.redirectUri,
      }).then((info) => {
        this.auth = info;
      });
    }

    /**
     * Check if a user is currently authenticated.
     *
     * @return {Boolean} - True if user is authenticated. False otherwise.
     */
    authenticated() {
      return this.auth && this.auth.isAuthenticated();
    }
  };

export default deepAuthMixin;

// export class DeepAuthService extends LitElement {
//   static get properties() {
//     return {
//       auth: {type: Object},
//       user: {type: Object}
//     };
//   }

//   constructor() {
//     super();
//     this.user = {};
//     this.auth = {};
//   }

//   async firstUpdated() {
//     this.auth = await createAuth0Client({
//       domain: authConfig.domain,
//       client_id: authConfig.clientId,
//       redirect_uri: authConfig.redirectUri
//     });

//     console.log("Authenticated: " + await this.auth.isAuthenticated());
//     debugger;
//   }

//   render() {
//     return html``;
//   }
// }
// customElements.define('deep-auth-service', DeepAuthService);
