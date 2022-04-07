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
import { K8sClient } from '@thinkdeep/k8s';

const logger = getLogger();

const startApolloServer = async () => {

  const commander = new Commander(logger);

  const kafka = new Kafka({
    clientId: 'deep-microservice-collection',
    brokers: [`${process.env.PREDECOS_KAFKA_HOST}:${process.env.PREDECOS_KAFKA_PORT}`]
  });
  const admin = kafka.admin();
  const producer = kafka.producer();
  const scaleSyncConsumer = kafka.consumer({groupId: `deep-microservice-collection-${Date.now()}`});
  const applicationConsumer = kafka.consumer({ groupId: 'deep-microservice-collection-consumer' });

  const mongoClient = new MongoClient(process.env.PREDECOS_MONGODB_CONNECTION_STRING);

  await attachExitHandler( async () => {

    await commander.stopAllCommands();

    logger.info('Closing Kafka connections.');
    await producer.disconnect();
    await scaleSyncConsumer.disconnect();
    await applicationConsumer.disconnect();
    await admin.disconnect();

    logger.info('Closing MongoDB connection');
    await mongoClient.close();
  });

  logger.info('Connecting with kafka admin.');
  await admin.connect();

  logger.info('Connecting with kafka producer.');
  await producer.connect();

  logger.info('Connecting with kafka scale synchronization consumer.');
  await scaleSyncConsumer.connect();

  logger.info('Connecting with kafka application consumer.');
  await applicationConsumer.connect();

  logger.info('Connecting with MongoDB.');
  await mongoClient.connect();

  logger.info("Connected successfully.");

  const k8sClient = await new K8sClient().init();
  const tweetStore = new TweetStore(mongoClient.db('admin').collection('tweets'));
  const economicEntityMemo = new EconomicEntityMemo(mongoClient.db('admin').collection('memo'), logger);
  const collectionService = new CollectionService(tweetStore, economicEntityMemo, commander, admin, producer, applicationConsumer, scaleSyncConsumer, k8sClient, logger);

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
    allowedOrigins = allowedOrigins.concat([/^https?:\/\/localhost:[0-9]{1,5}/, 'https://studio.apollographql.com']);
  }

  const path = process.env.GRAPHQL_PATH;
  if (!path) {
      throw new Error(`A path at which the application can be accessed is required (i.e, /graphql). Received: ${path}`);
  }

  logger.debug(`Applying middleware.`);
  server.applyMiddleware({
      app,
      path,
      cors: {
          origin: allowedOrigins,
          methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS,CONNECT,TRACE',
          credentials: true,
      },
  });

  const port = Number(process.env.GRAPHQL_PORT);
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