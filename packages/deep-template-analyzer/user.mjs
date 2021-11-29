
import createAuth0Client from '@auth0/auth0-spa-js';

let auth0 = null;
/**
 * Fetch the singleton instance.
 * @param {Object} options
 * @returns
 */
const getUser = async (options = {
    domain: 'predecos.us.auth0.com',
    clientId: 'T4NyuF1MTRTLTHmEvCC5hEDV5zsmG6aQ',
    audience: 'https://www.predecos.com/api/v1',
}) => {
    if (!auth0) {
        await initAuth(options);
    }
    const profile = await auth0.getUser();
    const loggedIn = await auth0.isAuthenticated();
    let token = '';
    if (loggedIn) {
        token = await auth0.getTokenSilently();
    }
    return { profile, login, logout, loggedIn, token };
}

/**
 * Initialize the user object.
 */
 const initAuth = async (options) => {
    if (!options?.domain || !options.clientId || !options.audience) {
        throw new Error('The domain, clientId and audience are required.');
    }

    const { domain, clientId, audience } = options;

    auth0 = await createAuth0Client({
        domain,
        client_id: clientId,
        redirect_uri: globalThis.location.origin,
        cacheLocation: 'localstorage',
        audience: audience,
        advancedOptions: {
            // TODO: Test this with new user
            defaultScope: 'openid profile email read:all',
        },
    });

    if (!auth0) {
        throw new Error('Failed to create auth client.');
    }

    const isAuthenticated = await auth0.isAuthenticated();
    const query = globalThis.location.search || '';
    if (!isAuthenticated &&
        query.includes('code=') &&
        query.includes('state=')) {

        // Parse auth info in url
        await auth0.handleRedirectCallback();

        // Remove query from url
        globalThis.history.replaceState({}, document.title, '/');
    }
}



/**
 * Show the login window.
 * @return {Promise} Resolves on completion of login.
 */
const login = async () => {
    await auth0.loginWithRedirect();
};

/**
 * Log the user out.
 */
const logout = async () => {
    await auth0.logout({
        returnTo: globalThis.location.origin,
    });
};

export { getUser }