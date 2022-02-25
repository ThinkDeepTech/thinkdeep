import {buildSubgraphSchema} from '@apollo/subgraph';
import { AnalysisClient } from './analysis-client.mjs';
import {ApolloServer} from 'apollo-server-express';
import express from 'express';
import { getLogger } from './get-logger.mjs';
import { Kafka } from 'kafkajs';
import { loggingPlugin } from './logging-plugin.mjs';
import {MongoClient} from 'mongodb';
import {resolvers} from './resolvers.mjs';
import {typeDefs} from './schema.mjs';

const logger = getLogger();

const mongoClient = new MongoClient(process.env.PREDECOS_MONGODB_CONNECTION_STRING);

const kafkaBroker = `${process.env.PREDECOS_KAFKA_HOST}:${process.env.PREDECOS_KAFKA_PORT}`;
logger.info(`Creating kafka client with broker ${kafkaBroker}`)
const kafkaClient = new Kafka({
  clientId: 'deep-microservice-analysis',
  brokers: [kafkaBroker]
});

const apolloServer = new ApolloServer({
  schema: buildSubgraphSchema([{typeDefs, resolvers}]),
  dataSources: () => ({analysisService}),
  context: ({req}) => {
    const permissions = req.headers.permissions ? JSON.parse(req.headers.permissions) : null;
    return {permissions};
  },
  plugins: [
    loggingPlugin
  ]
});

(async () => {

  const microserviceClient = new AnalysisClient(mongoClient, kafkaClient, apolloServer, express(), logger);

  await microserviceClient.connect();

  await microserviceClient.listen();

})().catch((e) => {

  logger.error(`An Error Occurred: ${JSON.stringify(e)}, message: ${e.message.toString()}`);
  process.emit('SIGTERM');
});