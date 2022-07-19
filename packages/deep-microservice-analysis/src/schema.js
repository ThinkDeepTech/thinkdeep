import {gql} from 'apollo-server';

const typeDefs = gql`
  scalar Date

  type SentimentResult {
    utcDateTime: Date!
    comparative: Float!
    tweets: [Tweet!]!
  }

  type Tweet {
    text: String!
  }

  enum EconomicEntityType {
    BUSINESS
  }

  type EconomicEntity {
    name: String!
    type: EconomicEntityType!
  }

  input EconomicEntityInput {
    name: String!
    type: EconomicEntityType!
  }

  extend type Query {
    getSentiments(
      economicEntities: [EconomicEntityInput!]!
      startDate: Date!
      endDate: Date
    ): [[SentimentResult!]!]!
  }
`;

export {typeDefs};
