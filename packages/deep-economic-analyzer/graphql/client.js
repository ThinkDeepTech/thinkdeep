import {
  ApolloClient,
  HttpLink,
  InMemoryCache,
  split,
} from '@apollo/client/core';
import {setContext} from '@apollo/client/link/context';
import {getMainDefinition} from '@apollo/client/utilities';
import {WebSocketLink} from './web-socket-link.js';

/**
 * Initialize the apollo client for use with the application.
 *
 * @param {Object} user Currently logged in user.
 */
const initApolloClient = async (user) => {
  const authHeaders = (_user) => {
    return {
      authorization: _user?.accessToken ? `Bearer ${_user.accessToken}` : '',
      me: _user?.idToken ? _user.idToken : '',
    };
  };

  const cache = new InMemoryCache({addTypename: false});

  const wsLink = new WebSocketLink({
    url: process.env.PREDECOS_MICROSERVICE_SUBSCRIPTION_URL,
    connectionParams: () => {
      return authHeaders(user);
    },
  });

  const httpLink = new HttpLink({
    uri: process.env.PREDECOS_MICROSERVICE_GATEWAY_URL,
    credentials: 'include',
  });

  const backendLink = split(
    ({query}) => {
      const definition = getMainDefinition(query);
      return (
        definition.kind === 'OperationDefinition' &&
        definition.operation === 'subscription'
      );
    },
    wsLink,
    httpLink
  );

  const authLink = setContext((_, {headers}) => {
    return {
      headers: {...headers, ...authHeaders(user)},
    };
  });

  // NOTE: Assignment to the global __APOLLO_CLIENT__ ensures all application graphql requests are made using the specified client.
  globalThis.__APOLLO_CLIENT__ = new ApolloClient({
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
      },
    },
  });
};

const setApolloClientForTesting = (mockClient) => {
  globalThis.__APOLLO_CLIENT__ = mockClient;
};

export {initApolloClient, setApolloClientForTesting};
