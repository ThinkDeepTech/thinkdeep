import { ApolloClient, HttpLink, InMemoryCache, split } from '@apollo/client/core';
import { setContext } from '@apollo/client/link/context';
import { getMainDefinition } from '@apollo/client/utilities';
import { WebSocketLink } from './web-socket-link.js';

import { getUser } from '../user.js';

let client = globalThis.__APOLLO_CLIENT__ || null;
/**
 * Initialize the apollo client for use with the application.
 */
const initApolloClient = async () => {

    if (!client) {

        const authHeaders = (user) => {
          return {
            authorization: user?.accessToken ? `Bearer ${user.accessToken}` : '',
            me: user?.idToken ? user.idToken : '',
          };
        };

        const user = await getUser();

        const cache = new InMemoryCache({ addTypename: false });

        const wsLink = new WebSocketLink({
          url: process.env.PREDECOS_MICROSERVICE_SUBSCRIPTION_URL,
          connectionParams: () => {
            const { authorization, me } = authHeaders(user);
            return { authorization, me };
          },
        });

        const httpLink = new HttpLink({
            uri: process.env.PREDECOS_MICROSERVICE_GATEWAY_URL,
            credentials: 'include'
        });

        const backendLink = split(
            ({ query }) => {
                const definition = getMainDefinition(query);
                return definition.kind === "OperationDefinition" && definition.operation === 'subscription';
              },
              wsLink,
              httpLink
        );

        const authLink = setContext((_, {headers}) => {
            const { authorization, me } = authHeaders(user);
            return {
                headers: { ...headers, authorization, me }
            };
        });

        client = new ApolloClient({
            cache,
            link: authLink.concat(backendLink),
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
    globalThis.__APOLLO_CLIENT__ = mockClient;
}

export { initApolloClient, setApolloClientForTesting };