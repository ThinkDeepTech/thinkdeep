import { ApolloClient, HttpLink, InMemoryCache, split } from '@apollo/client/core';
import { setContext } from '@apollo/client/link/context';
// import { getMainDefinition } from '@apollo/client/utilities';
// import { WebSocketLink } from '@apollo/client/link/ws';

import { getUser } from '../user.mjs';

let client = null;
/**
 * Initialize the apollo client for use with the application.
 */
const initApolloClient = async () => {

    if (!client) {
        const user = await getUser();

        const cache = new InMemoryCache({ addTypename: false });

        // TODO: Remove hard coding
        // const wsLink = new WebSocketLink({
        //     url: `ws://localhost:4004/graphql`
        // });

        const httpLink = new HttpLink({
            uri: PREDECOS_MICROSERVICE_GATEWAY_URL,
            credentials: 'include'
        });

        // const backendLink = split(
        //     ({ query }) => {
        //         const definition = getMainDefinition(query);
        //         return definition.kind === "OperationDefinition" && definition.operation === 'subscription';
        //       },
        //       wsLink,
        //       httpLink
        // )

        const authLink = setContext((_, {headers}) => {
            return {
                headers: {
                    ...headers,
                    authorization: !!user?.accessToken ? `Bearer ${user.accessToken}` : '',
                    me: !!user?.idToken ? user.idToken : ''
                }
            };
        });

        client = new ApolloClient({
            cache,
            link: authLink.concat(httpLink),
            defaultOptions: {
                watchQuery: {
                    fetchPolicy: 'no-cache',
                    errorPolicy: 'ignore',
                },
                query: {
                    fetchPolicy: 'no-cache',
                    errorPolicy: 'all',
                }
            }
        });
    }

    // NOTE: This ensures all application graphql requests are made using the specified client.
    globalThis.__APOLLO_CLIENT__ = client;
}

const setApolloClientForTesting = (mockClient) => {
    client = mockClient;
}

export { initApolloClient, setApolloClientForTesting };