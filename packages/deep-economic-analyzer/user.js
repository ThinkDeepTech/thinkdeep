
import createAuth0Client from '@auth0/auth0-spa-js';

globalThis.auth0 = null;
/**
 * Fetch user data.
 * @param {Object} options
 * @return {Object} User object.
 */
const getUser = async (options = {
    domain: process.env.PREDECOS_AUTH_DOMAIN,
    clientId: process.env.PREDECOS_AUTH_CLIENT_ID,
    audience: process.env.PREDECOS_AUTH_AUDIENCE,
}) => {
    if (!globalThis.auth0) {
        await initAuth(options);
    }
    const auth0 = globalThis.auth0;
    const profile = await auth0.getUser();
    const loggedIn = await auth0.isAuthenticated();
    let accessToken = '';
    let idToken = '';
    if (loggedIn) {
        accessToken = await auth0.getTokenSilently();
        idToken = (await auth0.getIdTokenClaims()).__raw;
    }
    return { profile, login, logout, loggedIn, accessToken, idToken };
}

/**
 * Initialize auth library.
 * @param {Object} options - Object including the auth domain, clientId and audience.
 *
 * NOTE: Excluding the audience in the call to createAuth0Client results in a malformed
 * access token being returned. This can cause a great deal of confusion when encountered.
 */
 const initAuth = async (options) => {
    if (!options?.domain || !options.clientId || !options.audience) {
        throw new Error('The domain, clientId and audience are required.');
    }

    const { domain, clientId, audience } = options;

    try {
        globalThis.auth0 = await createAuth0Client({
            domain,
            client_id: clientId,
            redirect_uri: globalThis.location.origin,
            cacheLocation: 'localstorage',
            audience,
            scope: 'openid profile email read:all'
        });
    } catch(e) {
        console.log(`An error occurred while creating the auth client: ${e.message}`);
    }

    if (!globalThis.auth0) {
        throw new Error('Failed to create auth client.');
    }

    const auth0 = globalThis.auth0;
    const isAuthenticated = await auth0.isAuthenticated();
    const query = globalThis.location.search || '';
    if (!isAuthenticated &&
        query.includes('code=') &&
        query.includes('state=')) {

        // Parse auth info in url
        await auth0.handleRedirectCallback();

        // Remove parsed info from url
        globalThis.history.replaceState({}, document.title, '/');
    }
}

/**
 * Show the login window and prompt for user login.
 * @param {String} redirectUri Uri to which the user will be redirected after login.
 */
const login = async (redirectUri = globalThis.location.origin) => {
    return globalThis.auth0.loginWithRedirect({
        redirect_uri: redirectUri
      });
};

/**
 * Log the user out.
 */
const logout = async () => {
    return globalThis.auth0.logout({
        returnTo: globalThis.location.origin,
    });
};

/**
 * Set the auth0 object.
 *
 * NOTE: This is included purely for testing purposes and should not be done
 * in source code.
 *
 * @param {Object} authClient - Auth client for use with testing.
 */
const setAuthClientForTesting = (authClient) => {
    globalThis.auth0 = authClient;
};

export {
    getUser,
    setAuthClientForTesting
}