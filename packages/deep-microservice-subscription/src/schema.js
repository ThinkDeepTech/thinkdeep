import {gql} from 'apollo-server';

const typeDefs = gql`
  type Subscription {
    updateSentiments(
      economicEntities: [EconomicEntityInput!]!
      startDate: Date!
      endDate: Date
    ): SentimentResult!
  }
`;

export {typeDefs};
