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
    ],
    buildService({name, url}) {
      return new RemoteGraphQLDataSource({
        url,
        willSendRequest(thing) {
          // TODO
          // request.http.headers.set(
          //   'user',
          //   context.user ? JSON.stringify(context.user) : null
          // );
          const request = thing.request;
          // const context = thing.context;
          request.http.headers.set(
            'user',
            request.user ? JSON.stringify(request.user) : null
          );
        },
      });
    },
  });

  const server = new ApolloServer({
    gateway,
    subscriptions: false,
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

  app.use('/', jwtHandler);

  // TODO
  // app.use('/', (req, res, next) => {
  //   debugger;
  //   next();
  // });

  server.applyMiddleware({app});

  app.listen({port}, () =>
    // eslint-disable-next-line
    console.log(`Server ready at http://localhost:${port}${server.graphqlPath}`)
  );
};

startGatewayService();
