import {gql} from 'apollo-server';

const typeDefs = gql`
  enum EconomicEntityType {
    BUSINESS
  }

  type CollectEconomicDataResponse {
    success: Boolean!
  }

  extend type Mutation {
    collectEconomicData(
      economicEntityName: String!
      economicEntityType: EconomicEntityType!
    ): CollectEconomicDataResponse!
  }
`;

export {typeDefs};
