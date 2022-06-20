import {gql} from 'apollo-server';

const typeDefs = gql`
  scalar Date

  type AnalysisResult {
    year: [Node!]!
    month: [Node!]!
    day: [Node!]!
    hour: [Node!]!
    minute: [Node!]!
  }

  type Node {
    numChildren: Int!
    value: Float
    firstChild: Int
  }

  enum EconomicEntityType {
    BUSINESS
  }

  type EconomicEntity {
    name: String!
    type: EconomicEntityType!
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
      economicEntities: [EconomicEntity!]!
      startDate: Date!
      endDate: Date
    ): [AnalysisResult!]!
  }
`;

export {typeDefs};
