import {ApolloServer} from 'apollo-server';
import typeDefs from './schema.mjs';

// TODO: Actually pull and populate data from DB. Remove stubbing.
// import PostgresDataSource from './datasources/PostgresDataSource.mjs'

const server = new ApolloServer({
  typeDefs,
  // dataSources {
  //     sqlAPI: new PostgresDataSource()
  // }
});

server.listen().then(() => {
  // eslint-disable-next-line
  console.log(`
        Server is running!
        Listening on port 4000
        Explore at https://studio.apollographql.com/sandbox
    `);
});
