import {buildSubgraphSchema} from '@apollo/subgraph';
import {attachExitHandler} from '@thinkdeep/attach-exit-handler';
import {getPublicIP} from '@thinkdeep/get-public-ip';
import {ApolloServer} from 'apollo-server-express';
import { ConfigurationService } from './configuration-service.mjs';
import {ConfigurationStore} from './datasource/configuration-store.mjs';
import express from 'express';
import {getLogger} from './get-logger.mjs';
import {loggingPlugin} from './logging-plugin.mjs';
import {MongoClient} from 'mongodb';
import process from 'process';
import {resolvers} from './resolvers.mjs';
import {typeDefs} from './schema.mjs';

const logger = getLogger();

const mongoClient = new MongoClient(process.env.PREDECOS_MONGODB_CONNECTION_STRING);

const startApolloServer = async () => {

  await attachExitHandler(async () => {
    await mongoClient.close();
  });

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
    allowedOrigins = allowedOrigins.concat([/^https?:\/\/localhost:[0-9]{1,5})/, 'https://studio.apollographql.com']);
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