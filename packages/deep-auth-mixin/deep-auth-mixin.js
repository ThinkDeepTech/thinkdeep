import createAuth0Client from '@auth0/auth0-spa-js';
import authConfig from './auth0_config';

let auth0 = null;
globalThis.onload = async () => {
  auth0 = await createAuth0Client({
    domain: authConfig.domain,
    client_id: authConfig.clientId,
    redirect_uri: globalThis.location.origin,
    useRefreshTokens: true,
    cacheLocation: 'localstorage',
  });

  const isAuthenticated = await auth0.isAuthenticated();
  if (isAuthenticated) return;

  const query = globalThis.location.search || '';
  if (query.includes('code=') && query.includes('state=')) {
    // Parse auth info in url
    await auth0.handleRedirectCallback();

    // Remove query from url
    globalThis.history.replaceState({}, document.title, '/');
  }

  // const user = await auth0.getUser();
  // debugger;
};

const deepAuthMixin = (baseClass) =>
  class extends baseClass {
    /**
     * Show the login window.
     * @return {Promise} Resolves on completion of login.
     */
    async login() {
      await auth0.loginWithRedirect();
    }

    /**
     * Log the user out.
     */
    async logout() {
      await auth0.logout({
        returnTo: globalThis.location.origin,
      });
    }

    /**
     * Get the user profile.
     * @return The user profile object.
     */
    async user() {
      await auth0.getUser();
    }

    /**
     * Check if a user is currently authenticated.
     *
     * @return {Boolean} - True if user is authenticated. False otherwise.
     */
    async isAuthenticated() {
      await auth0.isAuthenticated();
    }
  };

export default deepAuthMixin;

// // export default deepAuthMixin;
// import {html, LitElement} from 'lit-element';

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
//     this.lock = new Auth0Lock(authConfig.clientId, authConfig.domain);
//     this.profile = null;
//     this.accessToken = '';

//     this.lock.on('authenticated', (authResult) => {
//       this.lock.getUserInfo(authResult.accessToken, (error, profileResult) => {
//         if (error) {
//           /* eslint-disable-next-line */
//           console.error(`Failed to get user information: ${error}`);
//         }

//         this.accessToken = authResult.accessToken;
//         this.profile = profileResult;
//       })
//     })

//   }

//   async firstUpdated() {
//     // this.auth = await createAuth0Client({
//     //   domain: authConfig.domain,
//     //   client_id: authConfig.clientId,
//     //   redirect_uri: authConfig.redirectUri
//     // });

//     // console.log("Authenticated: " + await this.auth.isAuthenticated());
//   }

//   onload() {
//     // console.log('Loaded Lock Script');
//     let x = 1;
//     x++;
//     alert(x);
//   }

//   render() {
//     return html`
//       <script src="https://cdn.auth0.com/js/lock/11.31/lock.min.js" @onload=${this.onload}></script>
//     `;
//   }
// }
// customElements.define('deep-auth-service', DeepAuthService);
