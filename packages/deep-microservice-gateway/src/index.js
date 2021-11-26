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
      jwksUri: process.env.PREDECOS_AUTH_JWKS_URI,
    }),
    audience: process.env.PREDECOS_AUTH_AUDIENCE,
    issuer: process.env.PREDECOS_AUTH_ISSUER,
    algorithms: ['RS256'],
    getToken: function fromHeaderOrQuerystring(req) {
      if (
        req.headers.authorization &&
        req.headers.authorization.split(' ')[0] === 'Bearer'
      ) {
        return req.headers.authorization.split(' ')[1];
      } else if (req.query && req.query.token) {
        return req.query.token;
      }
      return null;
    },
  });

  const app = express();

  // app.use('/', (req, res, next) => {
  //   console.log(`
  //     Headers:

  //     ${JSON.stringify(req.headers)}

  //   `)
  //   next();
  // });
  app.use('/', jwtHandler);

  server.applyMiddleware({app});

  // app.use(jwtHandler);

  app.listen({port}, () =>
    // eslint-disable-next-line
    console.log(`Server ready at http://localhost:${port}${server.graphqlPath}`)
  );
};

startGatewayService();
