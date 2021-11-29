import { ApolloClient, HttpLink, InMemoryCache } from '@apollo/client/core';
import { setContext } from '@apollo/client/link/context';

import { getUser } from '../user.mjs';

/**
 * Initialize the apollo client for use with the application.
 */
const initApolloClient = async () => {

    const user = await getUser();

    const cache = new InMemoryCache();

    const httpLink = new HttpLink({
        uri: 'http://localhost:4000/graphql',
        credentials: 'include'
    });

    const authLink = setContext((_, {headers}) => {
        return {
            headers: {
                ...headers,
                authorization: !!user.token ? `Bearer ${user.token}` : ''
            }
        };
    });

    const client = new ApolloClient({
        cache,
        link: authLink.concat(httpLink)
    });

    // NOTE: This ensures all application graphql requests are made using the specified client.
    globalThis.__APOLLO_CLIENT__ = client;
}

export { initApolloClient };