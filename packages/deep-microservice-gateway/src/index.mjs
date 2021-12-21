import {ApolloGateway, RemoteGraphQLDataSource} from '@apollo/gateway';
import {ApolloServer} from 'apollo-server-express';
import express from 'express';
import jwt from 'express-jwt';
import {getLogger} from './get-logger.mjs'
import {getPublicIP} from './get-public-ip.mjs';
import jwks from 'jwks-rsa';

const logger = getLogger();

const startGatewayService = async () => {

  const gateway = new ApolloGateway({
    serviceList: [
      {name: 'analysis', url: process.env.PREDECOS_MICROSERVICE_ANALYSIS_URL},
      {name: 'collection', url: process.env.PREDECOS_MICROSERVICE_COLLECTION_URL}
    ],
    buildService({name, url}) {
      return new RemoteGraphQLDataSource({
        url,
        willSendRequest({request, context}) {
          request.http.headers.set(
            'user',
            context?.req?.user ? JSON.stringify(context?.req?.user) : null
          );
        },
      });
    },
    logger
  });

  const server = new ApolloServer({
    gateway,
    subscriptions: false,
    context: ({req, res}) => ({req, res}),
  });
  await server.start();

  const jwtHandler = jwt({
    secret: jwks.expressJwtSecret({
      cache: true,
      rateLimit: true,
      jwksRequestsPerMinute: 5,
      jwksUri: process.env.PREDECOS_AUTH_JWKS_URI,
    }),
    audience: process.env.PREDECOS_AUTH_AUDIENCE,
    issuer: process.env.PREDECOS_AUTH_ISSUER,
    algorithms: ['RS256'],
    requestProperty: 'user',
  });

  const app = express();

  // NOTE: x-powered-by can allow attackers to determine what technologies are being used by software and
  // therefore how to attack. Therefore, it's disabled here.
  app.disable('x-powered-by');


  // NOTE: This handler must be present here in order for authorization to correctly operate. If placed
  // after server.applyMiddleWare(...) it simply doesn't execute. However, the presence of this handler
  // before server.applyMiddleWare(...) breaks Apollo Explorer.
  app.use(jwtHandler);

  let allowedOrigins = ['https://predecos.com', 'https://thinkdeep-d4624.web.app/']
  const isProduction = process.env.NODE_ENV.toLowerCase() === 'production';
  if (!isProduction) {
    allowedOrigins = allowedOrigins.concat(['https://localhost:8000', 'http://localhost:8000', 'https://studio.apollographql.com']);
  }

  server.applyMiddleware({
    app,
    cors: {
      origin: allowedOrigins,
      methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS,CONNECT,TRACE',
      credentials: true,
      preflightContinue: true
    },
  });

  const port = 4000;
  app.listen({port}, () =>
    logger.info(`Server ready at http://${getPublicIP()}:${port}${server.graphqlPath}`)
  );
};

startGatewayService().then(() => { }, (reason) => {
  logger.error(`An Error Occurred: ${JSON.stringify(reason)}`);
});