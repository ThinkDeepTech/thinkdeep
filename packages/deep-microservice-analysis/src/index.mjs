import {buildSubgraphSchema} from '@apollo/subgraph';
import {ApolloServer} from 'apollo-server-express';
import {AnalysisService} from './analysis-service.mjs';
import { CollectionBinding } from './collection-binding.mjs';
import {PostgresDataSource} from './datasource/postgres-datasource.mjs';
import express from 'express';
import {resolvers} from './resolvers.mjs';
import {typeDefs} from './schema.mjs';
import Sentiment from 'sentiment';

const startApolloServer = async () => {
  const knexConfig = {
    client: 'pg',
    connection: process.env.PREDECOS_PG_CONNECTION_STRING,
  };

  const collectionBinding = await CollectionBinding.create();
  const postgresDataSource = new PostgresDataSource(knexConfig);
  const analysisService = new AnalysisService(postgresDataSource, new Sentiment(), collectionBinding);

  const server = new ApolloServer({
    schema: buildSubgraphSchema([{typeDefs, resolvers}]),
    dataSources: () => ({analysisService}),
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

  server.applyMiddleware({
    app,
    cors: {
      origin: ['https://localhost:8000', 'http://localhost:8000', 'https://studio.apollographql.com'],
      methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS,CONNECT,TRACE',
      credentials: true,
    },
  });

  const port = 4001;
  await new Promise((resolve) => app.listen({port}, resolve));
  // eslint-disable-next-line
  console.log(
    `🚀 Server ready at http://localhost:${port}${server.graphqlPath}`
  );
};

startApolloServer();
