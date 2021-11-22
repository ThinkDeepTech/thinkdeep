import {ApolloServer} from 'apollo-server';
import typeDefs from './schema.mjs';
import {resolvers} from './resolvers.mjs';
import PostgresDataSource from './datasources/postgres-datasource.mjs';

const knexConfig = {
  client: 'pg',
  connection: {
    database: 'predecos',
    user: 'postgres',
    password: '',
  },
};

const pg = new PostgresDataSource(knexConfig);

const server = new ApolloServer({
  typeDefs,
  resolvers,
  dataSources: () => ({pg}),
});

server.listen().then(() => {
  // eslint-disable-next-line
  console.log(`
        Server is running!
        Listening on port 4000
        Explore at https://studio.apollographql.com/sandbox
    `);
});
