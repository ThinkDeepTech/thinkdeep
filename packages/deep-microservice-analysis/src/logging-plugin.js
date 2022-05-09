import {getLogger} from './get-logger.js';

const logger = getLogger();

const loggingPlugin = {
    // Fires whenever a GraphQL request is received from a client.
    async requestDidStart(requestContext) {
      logger.debug(`Request Started. Query: ${requestContext.request.query}`);

      return {
        // Fires whenever Apollo Server will parse a GraphQL
        // request to create its associated document AST.
        async parsingDidStart() {
          logger.debug('Parsing started.');
        },

        // Fires whenever Apollo Server will validate a
        // request's document AST against your GraphQL schema.
        async validationDidStart() {
          logger.debug('Validation started.');
        },

      }
    },
  };

  export { loggingPlugin };