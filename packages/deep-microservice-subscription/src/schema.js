import {gql} from 'apollo-server';

const typeDefs = gql`
  type Subscription {
    updateSentiments(
      economicEntityName: String!
      economicEntityType: EconomicEntityType!
    ): [Sentiment!]!
  }
`;

export {typeDefs};
