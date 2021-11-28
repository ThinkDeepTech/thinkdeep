import {buildSubgraphSchema} from '@apollo/subgraph';
import {ApolloServer} from 'apollo-server-express';
import {PostgresDataSource} from './datasource/postgres-datasource.mjs';
import express from 'express';
import {resolvers} from './resolvers.mjs';
import {typeDefs} from './schema.mjs';
import {EconomyService} from './economy-service.mjs';

const port = 4001;

const startApolloServer = async () => {
  const knexConfig = {
    client: 'pg',
    connection: process.env.PREDECOS_PG_CONNECTION_STRING,
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

  const app = express();

  // NOTE: x-powered-by can allow attackers to determine what technologies are being used by software and
  // therefore how to attack. Therefore, it's disabled here.
  app.disable('x-powered-by');

  server.applyMiddleware({app});

  await new Promise((resolve) => app.listen({port}, resolve));
  // eslint-disable-next-line
  console.log(
    `🚀 Server ready at http://localhost:${port}${server.graphqlPath}`
  );
};

startApolloServer();
