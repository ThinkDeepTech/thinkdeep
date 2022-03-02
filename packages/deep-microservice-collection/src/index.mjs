import {buildSubgraphSchema} from '@apollo/subgraph';
import k8s from '@kubernetes/client-node'
import {attachExitHandler} from '@thinkdeep/attach-exit-handler';
import {getPublicIP} from '@thinkdeep/get-public-ip';
import {ApolloServer} from 'apollo-server-express';
import {CollectionService} from './collection-service.mjs';
import {Commander} from './commander.mjs';
import {EconomicEntityMemo} from './datasource/economic-entity-memo.mjs';
import {TweetStore} from './datasource/tweet-store.mjs';
import express from 'express';
import {getLogger} from './get-logger.mjs';
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
const consumer = kafka.consumer({ groupId: 'deep-microservice-collection-consumer' });

const mongoClient = new MongoClient(process.env.PREDECOS_MONGODB_CONNECTION_STRING);

const startApolloServer = async () => {

  await attachExitHandler( async () => {

    await commander.stopAllCommands();

    logger.info('Closing Kafka connections.');
    await producer.disconnect();
    await consumer.disconnect();
    await admin.disconnect();

    logger.info('Closing MongoDB connection');
    await mongoClient.close();
  });

  await admin.connect();
  await producer.connect();
  await consumer.connect();
  await mongoClient.connect();

  console.log("Connected successfully to server");

  const tweetStore = new TweetStore(mongoClient.db('admin').collection('tweets'));
  const economicEntityMemo = new EconomicEntityMemo(mongoClient.db('admin').collection('memo'), logger);
  const collectionService = new CollectionService(tweetStore, economicEntityMemo, commander, admin, producer, consumer, k8s, logger);

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
  // therefore how to attack.
  app.disable('x-powered-by');

  // NOTE: Placing a forward slash at the end of any allowed origin causes a preflight error.
  let allowedOrigins = ['https://predecos.com', 'https://www.predecos.com', 'https://thinkdeep-d4624.web.app', 'https://www.thinkdeep-d4624.web.app']
  const isProduction = process.env.NODE_ENV === 'production';
  if (!isProduction) {
    allowedOrigins = allowedOrigins.concat(['https://localhost:8000', 'http://localhost:8000', 'https://studio.apollographql.com']);
  }

  const path = process.env.GRAPHQL_PATH;
  if (!path) {
      throw new Error(`A path at which the application can be accessed is required (i.e, /graphql). Received: ${path}`);
  }

  this._logger.debug(`Applying middleware.`);
  this._apolloServer.applyMiddleware({
      app: this._expressApp,
      path,
      cors: {
          origin: allowedOrigins,
          methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS,CONNECT,TRACE',
          credentials: true,
      },
  });

  const port = process.env.GRAPHQL_PORT;
  if (!port) {
      throw new Error(`A port at which the application can be accessed is required. Received: ${port}`);
  }

  await new Promise((resolve) => app.listen({port}, resolve));

  logger.info(
    `🚀 Server ready at http://${getPublicIP()}:${port}${server.graphqlPath}`
  );
};

startApolloServer().then(() => { /* Do nothing */ }).catch((error) => {
  logger.error(`An Error Occurred: ${JSON.stringify(error)}, message: ${error.message.toString()}`);
  process.emit('SIGTERM');
});