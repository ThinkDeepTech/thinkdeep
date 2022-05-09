import { ApolloLink, Observable} from '@apollo/client/core';

import { print } from 'graphql';
import { createClient } from 'graphql-ws';

/**
 * Web socker link used to tie apollo and graphql-ws together.
 *
 * See: https://github.com/enisdenjo/graphql-ws in the recipes section.
 */
 class WebSocketLink extends ApolloLink {

    constructor(clientOptions, request) {
      super(request);
      this.client = createClient(clientOptions);
    }

    request(operation) {
      return new Observable((sink) => {
        return this.client.subscribe(
          { ...operation, query: print(operation.query) },
          {
            next: sink.next.bind(sink),
            complete: sink.complete.bind(sink),
            error: (err) => {
              if (Array.isArray(err))
                return sink.error(
                  new Error(err.map(({ message }) => message).join(', ')),
                );

              if (err instanceof CloseEvent)
                return sink.error(
                  new Error(
                    `Socket closed with event ${err.code} ${err.reason || ''}`, // reason will be available on clean closes only
                  ),
                );

              return sink.error(err);
            },
          },
        );
      });
    }
  }

  export { WebSocketLink };