import {gql} from 'apollo-server';

const typeDefs = gql`
  enum EconomicEntityType {
    BUSINESS
  }

  type Sentiment {
    timestamp: Float!
    score: Float!
    tweets: [Tweet!]!
  }

  type Tweet {
    text: String!
  }

  extend type Query {
    sentiments(
      economicEntityName: String!
      economicEntityType: EconomicEntityType!
    ): [Sentiment!]!
  }
`;

export {typeDefs};
