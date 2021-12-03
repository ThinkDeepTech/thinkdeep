import {ApolloGateway, RemoteGraphQLDataSource} from '@apollo/gateway';
import {ApolloServer} from 'apollo-server-express';
import express from 'express';
import jwt from 'express-jwt';
import jwks from 'jwks-rsa';

const startGatewayService = async () => {
  const port = 4000;

  const gateway = new ApolloGateway({
    serviceList: [
      {name: 'economy', url: process.env.PREDECOS_MICROSERVICE_ECONOMY_URL},
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


  // TODO:
  app.use(jwtHandler);

  server.applyMiddleware({
    app,
    cors: {
      // TODO: Which origins should be allows and what's secure?
      origin: ['https://localhost:8000', 'http://localhost:8000', 'https://studio.apollographql.com'],
      methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS,CONNECT,TRACE',
      credentials: true,
    },
  });

  app.listen({port}, () =>
    // eslint-disable-next-line
    console.log(`Server ready at http://localhost:${port}${server.graphqlPath}`)
  );
};

startGatewayService();
