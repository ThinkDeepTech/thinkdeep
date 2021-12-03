import { gql } from 'apollo-server';

const typeDefs = gql`

    enum EconomicEntityType {
        BUSINESS
    }

    type CollectEconomicDataResponse {
        success: Boolean!
    }

    extend type Mutation {
        collectEconomicData(entityName: String!, entityType: EconomicEntityType!): CollectEconomicDataResponse!
    }
`;

export { typeDefs };