import {ApolloServer} from 'apollo-server';
import {PostgresDataSource} from './datasource/postgres-datasource.mjs';
import {resolvers} from './resolver/all.mjs';
import {typeDefs} from './schema.mjs';
import {EconomyService} from './service/economy-service.mjs';

const knexConfig = {
  client: 'pg',
  connection: process.env.PG_CONNECTION_STRING,
};

const db = new PostgresDataSource(knexConfig);
const economyService = new EconomyService(db);

const server = new ApolloServer({
  typeDefs,
  resolvers,
  dataSources: () => ({economyService}),
});

server.listen().then(() => {
  // eslint-disable-next-line
  console.log(`
        Server is running!
        Listening on port 4000
        Explore at https://studio.apollographql.com/sandbox
    `);
});
