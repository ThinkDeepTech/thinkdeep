import {buildSubgraphSchema} from '@apollo/subgraph';
import {ApolloServer} from 'apollo-server-express';
import {TwitterDataSource} from './datasource/twitter-datasource.mjs';
import express from 'express';
import {resolvers} from './resolvers.mjs';
import {typeDefs} from './schema.mjs';
import {CollectionService} from './collection-service.mjs';

const port = 4002;

const startApolloServer = async () => {

  const dataSource = new TwitterDataSource();
  const collectionService = new CollectionService(dataSource);

  const server = new ApolloServer({
    schema: buildSubgraphSchema([{typeDefs, resolvers}]),
    dataSources: () => ({collectionService}),
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

  await new Promise((resolve) => app.listen({port}, resolve));
  // eslint-disable-next-line
  console.log(
    `🚀 Server ready at http://localhost:${port}${server.graphqlPath}`
  );
};

startApolloServer();
