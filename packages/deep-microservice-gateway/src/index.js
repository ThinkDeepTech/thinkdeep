import {ApolloGateway, RemoteGraphQLDataSource} from '@apollo/gateway';
import {ApolloServer} from 'apollo-server-express';
import express from 'express';
import jwt from 'express-jwt';
import jwks from 'jwks-rsa';

const startGatewayService = async () => {
  const port = 4000;

  const gateway = new ApolloGateway({
    serviceList: [{name: 'economy', url: 'http://localhost:4001/graphql'}],
    buildService({name, url}) {
      return new RemoteGraphQLDataSource({
        url,
        willSendRequest({request, context}) {
          request.http.headers.set(
            'user',
            context.user ? JSON.stringify(context.user) : null
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
      jwksUri: 'https://predecos.us.auth0.com/.well-known/jwks.json',
    }),
    audience: 'https://www.predecos.com/api/v1',
    issuer: 'https://predecos.us.auth0.com/',
    algorithms: ['RS256'],
  });

  const app = express();

  server.applyMiddleware({app});

  app.use(jwtHandler);

  // TODO: Use same listening paradigm for both microservices.
  app.listen({port}, () =>
    // eslint-disable-next-line
    console.log(`Server ready at http://localhost:${port}${server.graphqlPath}`)
  );
};

startGatewayService();
