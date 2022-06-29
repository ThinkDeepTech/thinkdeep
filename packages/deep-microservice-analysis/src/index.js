import {buildSubgraphSchema} from '@apollo/subgraph';
import {attachExitHandler} from '@thinkdeep/attach-exit-handler';
import {Microservice} from './microservice.js';
import {AnalysisService} from './analysis-service.js';
import {ApolloServer} from 'apollo-server-express';
import {Neo4jStore} from './datasource/neo4j-store.js';
import {SentimentStore} from './datasource/sentiment-store.js';
import express from 'express';
import {getLogger} from './get-logger.js';
import depthLimit from 'graphql-depth-limit';
import {Kafka} from 'kafkajs';
import {loggingPlugin} from './logging-plugin.js';
import {MongoClient} from 'mongodb';
import neo4j from 'neo4j-driver';
import {resolvers} from './resolvers.js';
import {typeDefs} from './schema.js';
import Sentiment from 'sentiment';

const logger = getLogger();

(async () => {
  const mongoClient = new MongoClient(
    process.env.PREDECOS_MONGODB_CONNECTION_STRING
  );

  await attachExitHandler(async () => {
    logger.info('Closing MongoDB connection.');
    await mongoClient.close();
  });

  logger.info('Connecting to MongoDB.');
  await mongoClient.connect();

  const kafkaBroker = `${process.env.PREDECOS_KAFKA_HOST}:${process.env.PREDECOS_KAFKA_PORT}`;
  logger.info(`Creating kafka client with broker ${kafkaBroker}`);
  const kafkaClient = new Kafka({
    clientId: 'deep-microservice-analysis',
    brokers: [kafkaBroker],
  });

  const neo4jStore = new Neo4jStore({
    url: process.env.MICROSERVICE_ANALYSIS_NEO4J_URL,
    authToken: neo4j.auth.basic(
      process.env.MICROSERVICE_ANALYSIS_NEO4J_USERNAME,
      process.env.MICROSERVICE_ANALYSIS_NEO4J_PASSWORD
    ),
    defaultDatabase: 'neo4j',
    defaultAccessMode: neo4j.session.READ,
  });

  const sentimentStore = new SentimentStore(
    mongoClient.db('admin').collection('sentiments'),
    logger
  );
  const analysisService = new AnalysisService(
    sentimentStore,
    neo4jStore,
    new Sentiment(),
    kafkaClient,
    logger
  );

  await analysisService.connect();

  const apolloServer = new ApolloServer({
    schema: buildSubgraphSchema([{typeDefs, resolvers}]),
    dataSources: () => ({analysisService}),
    context: ({req}) => {
      const permissions = req.headers.permissions
        ? JSON.parse(req.headers.permissions)
        : null;
      return {permissions};
    },
    plugins: [loggingPlugin],
    csrfPrevention: true,
    validationRules: [depthLimit(10)],
  });

  const microservice = new Microservice(apolloServer, express(), logger);

  await microservice.listen();
})().catch((e) => {
  logger.error(
    `An Error Occurred: ${JSON.stringify(e)}, message: ${e.message.toString()}`
  );

  process.emit('SIGTERM');
});
