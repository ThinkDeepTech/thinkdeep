import {ApolloServer} from 'apollo-server';
import {PostgresDataSource} from './datasources/postgres-datasource.mjs';
import {resolvers} from './resolvers.mjs';
import {typeDefs} from './schema.mjs';

const knexConfig = {
  client: 'pg',
  connection: process.env.PG_CONNECTION_STRING,
};

const db = new PostgresDataSource(knexConfig);

const server = new ApolloServer({
  typeDefs,
  resolvers,
  dataSources: () => ({db}),
});

server.listen().then(() => {
  // TODO: Migrate to logging framework
  // eslint-disable-next-line
  console.log(`
        Server is running!
        Listening on port 4000
        Explore at https://studio.apollographql.com/sandbox
    `);
});
