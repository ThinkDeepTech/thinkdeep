import {buildSubgraphSchema} from '@apollo/subgraph';
import {ApolloServer} from 'apollo-server-express';
import {AnalysisService} from './analysis-service.mjs';
import {PostgresDataSource} from './datasource/postgres-datasource.mjs';
import express from 'express';
import { getLogger } from './get-logger.mjs';
import { getPublicIP } from './get-public-ip.mjs';
import { Kafka } from 'kafkajs';
import { loggingPlugin } from './logging-plugin.mjs';
import {resolvers} from './resolvers.mjs';
import {typeDefs} from './schema.mjs';
import Sentiment from 'sentiment';

const logger = getLogger();

const kafka = new Kafka({
  clientId: 'deep-microservice-analysis',
  brokers: [process.env.PREDECOS_KAFKA_URL]
});
const consumer = kafka.consumer({ groupId: 'deep-microservice-analysis-consumer' });
const producer = kafka.producer();

const performCleanup = async () => {
  await consumer.disconnect();
  await producer.disconnect();
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

  await consumer.connect();
  await producer.connect();

  const knexConfig = {
    client: 'pg',
    connection: process.env.PREDECOS_PG_CONNECTION_STRING,
  };

  const postgresDataSource = new PostgresDataSource(knexConfig);
  const analysisService = new AnalysisService(postgresDataSource, new Sentiment(), consumer, producer, logger);

  const server = new ApolloServer({
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
  await server.start();

  const app = express();

  // NOTE: x-powered-by can allow attackers to determine what technologies are being used by software and
  // therefore how to attack. Therefore, it's disabled here.
  app.disable('x-powered-by');

  // NOTE: Placing a forward slash at the end of any allowed origin causes a preflight error.
  let allowedOrigins = ['https://predecos.com', 'https://www.predecos.com', 'https://thinkdeep-d4624.web.app', 'https://www.thinkdeep-d4624.web.app']
  const isProduction = process.env.NODE_ENV.toLowerCase() === 'production';
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

  const port = 4001;
  await new Promise((resolve) => app.listen({port}, resolve));
  logger.info(
    `🚀 Server ready at http://${getPublicIP()}:${port}${server.graphqlPath}`
  );
};

startApolloServer().then(() => { /* Do nothing */ }, (reason) => {
  logger.error(`An Error Occurred: ${JSON.stringify(reason)}`);
});