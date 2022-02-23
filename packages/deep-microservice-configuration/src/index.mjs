import {buildSubgraphSchema} from '@apollo/subgraph';
import {ApolloServer} from 'apollo-server-express';
import { ConfigurationService } from './configuration-service.mjs';
import {ConfigurationStore} from './datasource/configuration-store.mjs';
import express from 'express';
import {getLogger} from './get-logger.mjs';
import {getPublicIP} from './get-public-ip.mjs';
import {loggingPlugin} from './logging-plugin.mjs';
import {MongoClient} from 'mongodb';
import process from 'process';
import {resolvers} from './resolvers.mjs';
import {typeDefs} from './schema.mjs';

const logger = getLogger();

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
  process.on('SIGTERM', () => {
    process.exit(3);
  });
  process.on('uncaughtException', () => {
    process.exit(99);
  });
};

const startApolloServer = async () => {

  attachExitHandler(performCleanup);

  await mongoClient.connect();

  console.log("Connected successfully to server");

  const configurationStore = new ConfigurationStore(mongoClient.db('admin').collection('configurations'));
  const configurationService = new ConfigurationService(configurationStore, logger);

  const server = new ApolloServer({
    schema: buildSubgraphSchema([{typeDefs, resolvers}]),
    dataSources: () => ({configurationService}),
    context: ({req}) => {
      const permissions = req.headers.permissions ? JSON.parse(req.headers.permissions) : null;
      const me = req.headers.me ? JSON.parse(req.headers.me) : null;
      return {permissions, me};
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


  const port = 4003;
  await new Promise((resolve) => app.listen({port}, resolve));

  logger.info(
    `🚀 Server ready at http://${getPublicIP()}:${port}${server.graphqlPath}`
  );
};

startApolloServer().then(() => { /* Do nothing */ }).catch((error) => {
  logger.error(`An Error Occurred: ${JSON.stringify(error)}, message: ${error.message.toString()}`);
});