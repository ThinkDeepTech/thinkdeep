import {buildSubgraphSchema} from '@apollo/subgraph';
import {getPublicIP} from '@thinkdeep/get-public-ip';
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

})().then(() => {

  logger.info(`🚀 Server ready at http://${getPublicIP()}:${port}${this.apolloServer.graphqlPath}`);
}).catch((e) => {

  logger.error(`An Error Occurred: ${JSON.stringify(e)}, message: ${e.message.toString()}`);
  process.emit('SIGTERM');
})






// const admin = kafka.admin();
// const consumer = kafka.consumer({ groupId: 'deep-microservice-analysis-consumer' });
// const producer = kafka.producer();

// const startApolloServer = async () => {

//   await attachExitHandler( async () => {

//     logger.info('Cleaning up kafka connections.');
//     await admin.disconnect();
//     await consumer.disconnect();
//     await producer.disconnect();

//     logger.info('Closing MongoDB connection.');
//     await mongoClient.close();
//   });

//   logger.info('Connecting to MongoDB.');
//   await mongoClient.connect();

//   logger.info('Connecting to Kafka.');
//   await admin.connect();
//   await consumer.connect();
//   await producer.connect();

//   const sentimentStore = new SentimentStore(mongoClient.db('admin').collection('sentiments'), logger);
//   const analysisService = new AnalysisService(sentimentStore, new Sentiment(), admin, consumer, producer, logger);

//   const server = new ApolloServer({
//     schema: buildSubgraphSchema([{typeDefs, resolvers}]),
//     dataSources: () => ({analysisService}),
//     context: ({req}) => {
//       const permissions = req.headers.permissions ? JSON.parse(req.headers.permissions) : null;
//       return {permissions};
//     },
//     plugins: [
//       loggingPlugin
//     ]
//   });
//   await server.start();

//   const app = express();

//   // NOTE: x-powered-by can allow attackers to determine what technologies are being used by software and
//   // therefore how to attack. Therefore, it's disabled here.
//   app.disable('x-powered-by');

//   // NOTE: Placing a forward slash at the end of any allowed origin causes a preflight error.
//   let allowedOrigins = ['https://predecos.com', 'https://www.predecos.com', 'https://thinkdeep-d4624.web.app', 'https://www.thinkdeep-d4624.web.app']
//   const isProduction = process.env.NODE_ENV.toLowerCase() === 'production';
//   if (!isProduction) {
//     allowedOrigins = allowedOrigins.concat(['https://localhost:8000', 'http://localhost:8000', 'https://studio.apollographql.com']);
//   }


//   server.applyMiddleware({
//     app,
//     cors: {
//       origin: allowedOrigins,
//       methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS,CONNECT,TRACE',
//       credentials: true,
//     },
//   });

//   const port = 4001;
//   await new Promise((resolve) => app.listen({port}, resolve));
//   logger.info(
//     `🚀 Server ready at http://${getPublicIP()}:${port}${server.graphqlPath}`
//   );
// };

// startApolloServer().then(() => { /* Do nothing */ }).catch((error) => {
//   logger.error(`An Error Occurred: ${JSON.stringify(error)}, message: ${error.message.toString()}`);
//   process.emit('SIGTERM');
// });