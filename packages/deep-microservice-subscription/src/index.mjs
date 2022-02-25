import {ApolloGateway} from '@apollo/gateway';
import {makeExecutableSchema} from '@graphql-tools/schema';
import {getPublicIP} from '@thinkdeep/get-public-ip';
import {gql} from 'apollo-server-express';
import cors from 'cors';
import express from 'express';
import jwt from 'express-jwt';
import {getLogger} from './get-logger.mjs';
import {execute, subscribe, printSchema, parse, getOperationAST, GraphQLError, validate} from 'graphql';
import { useServer } from 'graphql-ws/lib/use/ws';
import { createServer } from 'http';
import jwks from 'jwks-rsa';
// import {loggingPlugin} from './logging-plugin.mjs';
import process from 'process';
import {resolvers} from './resolvers.mjs';
import {typeDefs} from './schema.mjs';
import ws from 'ws';

const logger = getLogger();

const startApolloServer = async () => {

  const port = 4004;

  const validateAndAppendPermissions = jwt({
    secret: jwks.expressJwtSecret({
      cache: true,
      rateLimit: true,
      jwksRequestsPerMinute: 5,
      jwksUri: process.env.PREDECOS_AUTH_JWKS_URI,
    }),
    aud: process.env.PREDECOS_AUTH_AUDIENCE,
    issuer: process.env.PREDECOS_AUTH_ISSUER,
    algorithms: ['RS256'],
    requestProperty: 'permissions',
  });

  const validateAndAppendMe = jwt({
    secret: jwks.expressJwtSecret({
      cache: true,
      rateLimit: true,
      jwksRequestsPerMinute: 5,
      jwksUri: process.env.PREDECOS_AUTH_JWKS_URI,
    }),
    aud: process.env.PREDECOS_AUTH_AUDIENCE,
    issuer: process.env.PREDECOS_AUTH_ISSUER,
    algorithms: ['RS256'],
    requestProperty: 'me',
    getToken: (req) => {
      if (req.headers.me) {
        return req.headers.me;
      }
      return '';
    }
  });

  const validateAndFetchPermissionsAndMe = async (connectionParams, extra) => {

    if (!extra?.request) {
      throw new Error('The request object was not valid.');
    }

    const incomingRequest = extra.request || { };

    if (!Object.keys(incomingRequest).length) {
      throw new Error('There were no keys in the request');
    }

    const dummyRequest = {
      ...incomingRequest,
      headers: {
        authorization: connectionParams?.authorization || '',
        me: connectionParams?.me || '',
      }
    };

    // NOTE: This is a bit hacky but I want to reuse express-jwt's solution for completeness and consistency
    // with the gateway along with the safety of secret handling. It's kept consistent with the gateway microservice.
    // If an error is thrown, the connection will be closed thereby correctly performing the needed validation.
    await new Promise((resolve) => {

      const dummyNext = (error) => {
        if (!!error) {
          throw error;
        }
        resolve();
      };

      validateAndAppendPermissions(dummyRequest, undefined, dummyNext);

    });

    // TODO: Split this and the above logic into shared function + callback
    await new Promise((resolve) => {

      const dummyNext = (error) => {
        if (!!error) {
          throw error;
        }
        resolve();
      };

      validateAndAppendMe(dummyRequest, undefined, dummyNext);
    });

    return {
      permissions: dummyRequest?.permissions || {},
      me: dummyRequest?.me || {}
    }
  };

  const app = express();

  // NOTE: Placing a forward slash at the end of any allowed origin causes a preflight error.
  let allowedOrigins = ['https://predecos.com', 'https://www.predecos.com', 'https://thinkdeep-d4624.web.app', 'https://www.thinkdeep-d4624.web.app']
  const isProduction = process.env.NODE_ENV.toLowerCase() === 'production';
  if (!isProduction) {
    allowedOrigins = allowedOrigins.concat(['https://localhost:8000', 'http://localhost:8000', 'https://studio.apollographql.com']);
  }
  const corsOptions = {
    origin: allowedOrigins,
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS,CONNECT,TRACE',
    credentials: true
  };

  app.use(cors(corsOptions));

  // NOTE: x-powered-by can allow attackers to determine what technologies are being used by software and
  // therefore how to attack. Therefore, it's disabled here.
  app.disable('x-powered-by');

  const httpServer = createServer(app);
  const webSocketServer = new ws.Server({
    server: httpServer,
    path: '/graphql'
  });

  let schema = null;
  const gatewayProxy = new ApolloGateway({
    serviceList: [
      // NOTE: This is a direct copy of what's done in the gateway service. Keep the two synced.
      {name: 'analysis', url: process.env.PREDECOS_MICROSERVICE_ANALYSIS_URL},
      {name: 'collection', url: process.env.PREDECOS_MICROSERVICE_COLLECTION_URL},
      {name: 'configuration', url: process.env.PREDECOS_MICROSERVICE_CONFIGURATION_URL},
    ],
  });
  gatewayProxy.onSchemaChange((gatewaySchema) => {

    if (!typeDefs || !resolvers) {
      throw new Error(
        "Both `typeDefs` and `resolvers` are required to make the executable subscriptions schema."
      );
    }

    const gatewayTypeDefs = gatewaySchema
      ? gql(printSchema(gatewaySchema))
      : undefined;

    schema = makeExecutableSchema({
      typeDefs: [...(gatewayTypeDefs && [gatewayTypeDefs]), typeDefs],
      resolvers
    });
  })

  await gatewayProxy.load();

  useServer({
    execute,
    subscribe,
    context: async ({connectionParams, extra}) => {

      const { permissions, me } = await validateAndFetchPermissionsAndMe(connectionParams, extra);

      return { permissions, me };
    },
    onConnect: async ({connectionParams, extra}) => {
      await validateAndFetchPermissionsAndMe(connectionParams, extra);
    },
    onSubscribe: (_ctx, msg) => {

      // Construct the execution arguments
      const args = {
        schema, // <-- Use the previously defined `schema` here
        operationName: msg.payload.operationName,
        document: parse(msg.payload.query),
        variableValues: msg.payload.variables
      };

      const operationAST = getOperationAST(
        args.document,
        args.operationName
      );

      // Stops the subscription and sends an error message
      if (!operationAST) {
        return [new GraphQLError("Unable to identify operation")];
      }

      // Handle mutation and query requests
      if (operationAST.operation !== "subscription") {
        return [
          new GraphQLError("Only subscription operations are supported")
        ];
      }

      // Validate the operation document
      const errors = validate(args.schema, args.document);

      if (errors.length > 0) {
        return errors;
      }

      // Ready execution arguments
      return args;
    },
  }, webSocketServer);

  httpServer.listen({ port }, () => {
    logger.info(`🚀 Subscriptions ready at ws://${getPublicIP()}:${port}${webSocketServer.options.path}`);
  })
};

startApolloServer().then(() => { /* Do nothing */ }).catch((error) => {
  logger.error(`An Error Occurred: ${JSON.stringify(error)}, message: ${error.message.toString()}`);
});