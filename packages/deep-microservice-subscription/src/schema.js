import {gql} from 'apollo-server';

const typeDefs = gql`
  extend type Subscription {
    updateSentiments(
      economicEntities: [EconomicEntityInput!]!
      startDate: Date!
      endDate: Date
    ): [AnalysisResult!]!
  }
`;

export {typeDefs};
