import {buildSubgraphSchema} from '@apollo/subgraph';
import {ApolloServer} from 'apollo-server-express';
import {PostgresDataSource} from './datasource/postgres-datasource.mjs';
import express from 'express';
// import jwt from 'express-jwt';
// import jwks from 'jwks-rsa';
import {resolvers} from './resolvers.mjs';
import {typeDefs} from './schema.mjs';
import {EconomyService} from './service/economy-service.mjs';

const port = 4001;

const startApolloServer = async () => {
  const knexConfig = {
    client: 'pg',
    connection: process.env.PG_CONNECTION_STRING,
  };

  const db = new PostgresDataSource(knexConfig);
  const economyService = new EconomyService(db);

  const server = new ApolloServer({
    schema: buildSubgraphSchema([{typeDefs, resolvers}]),
    dataSources: () => ({economyService}),
    context: ({req}) => {
      const user = req.headers.user ? JSON.parse(req.headers.user) : null;
      return {user};
    },
  });

  await server.start();

  // TODO: Should each microservice implement jwt handling or should gateway provide single checkpoint
  // and remaining microservices are not publicly exposed?
  // const jwtHandler = jwt({
  //   secret: jwks.expressJwtSecret({
  //     cache: false,
  //     rateLimit: true,
  //     jwksRequestsPerMinute: 5,
  //     jwksUri: 'https://predecos.us.auth0.com/.well-known/jwks.json'
  //   }),
  //   audience: 'https://www.predecos.com/api/v1',
  //   issuer: 'https://predecos.us.auth0.com/',
  //   algorithms: ['RS256']
  // });

  const app = express();

  server.applyMiddleware({app});

  // app.use(jwtHandler);

  await new Promise((resolve) => app.listen({port}, resolve));
  // eslint-disable-next-line
  console.log(
    `🚀 Server ready at http://localhost:${port}${server.graphqlPath}`
  );
  return {server, app};
};

startApolloServer();
