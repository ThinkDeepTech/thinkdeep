import {buildSubgraphSchema} from '@apollo/subgraph';
import {ApolloServer} from 'apollo-server-express';
import {CollectionService} from './collection-service.mjs';
import {TweetStore} from './datasource/tweet-store.mjs'
import {TwitterAPI} from './datasource/twitter-api.mjs';
import express from 'express';
import {getPublicIP} from './get-public-ip.mjs';
import {MongoClient} from 'mongodb';
import os from 'os';
import process from 'process';
import {resolvers} from './resolvers.mjs';
import {typeDefs} from './schema.mjs';

const mongoClient = new MongoClient(process.env.PREDECOS_MONGODB_CONNECTION_STRING);

const performCleanup = async () => {
  await mongoClient.close();
};

const attachExitHandler = async (callback) => {
  process.on('cleanup', callback);
  process.on('exit', () => {
    process.emit('cleanup');
  });
  process.on('SIGINT', () => {
    process.exit(2);
  });
  process.on('uncaughtException', () => {
    process.exit(99);
  });
};

const startApolloServer = async () => {

  attachExitHandler(performCleanup);

  await mongoClient.connect();

  console.log("Connected successfully to server");

  const twitterAPI = new TwitterAPI();
  const tweetStore = new TweetStore(mongoClient.db('admin').collection('tweets'));
  const collectionService = new CollectionService(twitterAPI, tweetStore);

  const server = new ApolloServer({
    schema: buildSubgraphSchema([{typeDefs, resolvers}]),
    dataSources: () => ({collectionService}),
    context: ({req}) => {
      const user = req.headers.user ? JSON.parse(req.headers.user) : null;
      return {user};
    },

    // NOTE: Introspection has some security implications. It allows developers to query the API to figure out the structure
    // of the schema. This can be dangerous in production. However, these services are intended to be visible so this isn't
    // currently an issue.
    introspection: true,
    playground: true
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


  const port = 4002;
  await new Promise((resolve) => app.listen({port}, resolve));

  // eslint-disable-next-line
  console.log(
    `🚀 Server ready at http://${getPublicIP()}:${port}${server.graphqlPath}`
  );
};

startApolloServer().then(() => { }, (reason) => {
  console.log(`An Error Occurred: ${reason}`);
});