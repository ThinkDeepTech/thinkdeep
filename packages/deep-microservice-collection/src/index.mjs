import {buildSubgraphSchema} from '@apollo/subgraph';
import {ApolloServer} from 'apollo-server-express';
import {CollectionService} from './collection-service.mjs';
import {Commander} from './commander.mjs';
import {EconomicEntityMemo} from './datasource/economic-entity-memo.mjs';
import {TweetStore} from './datasource/tweet-store.mjs';
import {TwitterAPI} from './datasource/twitter-api.mjs';
import express from 'express';
import {getLogger} from './get-logger.mjs';
import {getPublicIP} from './get-public-ip.mjs';
import { Kafka } from 'kafkajs';
import {loggingPlugin} from './logging-plugin.mjs';
import {MongoClient} from 'mongodb';
import process from 'process';
import {resolvers} from './resolvers.mjs';
import {typeDefs} from './schema.mjs';

const logger = getLogger();

const commander = new Commander(logger);

const kafka = new Kafka({
  clientId: 'deep-microservice-collection',
  brokers: [`${process.env.PREDECOS_KAFKA_HOST}:${process.env.PREDECOS_KAFKA_PORT}`]
});
const admin = kafka.admin();
const producer = kafka.producer();

const mongoClient = new MongoClient(process.env.PREDECOS_MONGODB_CONNECTION_STRING);

const performCleanup = async () => {
  await mongoClient.close();
  await producer.disconnect();
  await admin.disconnect();

  await commander.stopAllCommands();
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
  await admin.connect();
  await producer.connect();

  console.log("Connected successfully to server");

  const twitterAPI = new TwitterAPI();
  const tweetStore = new TweetStore(mongoClient.db('admin').collection('tweets'));
  const economicEntityMemo = new EconomicEntityMemo(mongoClient.db('admin').collection('memo'), logger);
  const collectionService = new CollectionService(twitterAPI, tweetStore, economicEntityMemo, commander, admin, producer, logger);

  const server = new ApolloServer({
    schema: buildSubgraphSchema([{typeDefs, resolvers}]),
    dataSources: () => ({collectionService}),
    context: ({req}) => {
      const permissions = req.headers.permissions ? JSON.parse(req.headers.permissions) : null;
      return {permissions};
    },
    plugins: [
      loggingPlugin
    ],
  });
  await server.start();

  const app = express();

  // NOTE: x-powered-by can allow attackers to determine what technologies are being used by software and
  // therefore how to attack. Therefore, it's disabled here.
  app.disable('x-powered-by');

  // NOTE: Placing a forward slash at the end of any allowed origin causes a preflight error.
  let allowedOrigins = ['https://predecos.com', 'https://www.predecos.com', 'https://thinkdeep-d4624.web.app', 'https://www.thinkdeep-d4624.web.app']
  const isProduction = process.env.NODE_ENV === 'production';
  if (!isProduction) {
    allowedOrigins = allowedOrigins.concat(['https://localhost:8000', 'http://localhost:8000', 'https://studio.apollographql.com']);
  }


  server.applyMiddleware({
    app,
    cors: {
      origin: allowedOrigins,
      methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS,CONNECT,TRACE',
      credentials: true,
    },
  });


  const port = 4002;
  await new Promise((resolve) => app.listen({port}, resolve));

  logger.info(
    `🚀 Server ready at http://${getPublicIP()}:${port}${server.graphqlPath}`
  );
};

startApolloServer().then(() => { /* Do nothing */ }).catch((error) => {
  logger.error(`An Error Occurred: ${JSON.stringify(error)}, message: ${error.message.toString()}`);
});