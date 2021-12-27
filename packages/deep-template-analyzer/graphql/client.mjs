import { ApolloClient, HttpLink, InMemoryCache } from '@apollo/client/core';
import { setContext } from '@apollo/client/link/context';

import { getUser } from '../user.mjs';

let client = null;
/**
 * Initialize the apollo client for use with the application.
 */
const initApolloClient = async () => {

    if (!client) {
        const user = await getUser();

        const cache = new InMemoryCache();

        const httpLink = new HttpLink({
            uri: PREDECOS_MICROSERVICE_GATEWAY_URL,
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

        client = new ApolloClient({
            cache,
            link: authLink.concat(httpLink)
        });
    }

    // NOTE: This ensures all application graphql requests are made using the specified client.
    globalThis.__APOLLO_CLIENT__ = client;
}

const setApolloClientForTesting = (mockClient) => {
    client = mockClient;
}

export { initApolloClient, setApolloClientForTesting };