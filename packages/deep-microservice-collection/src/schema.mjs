import { gql } from 'apollo-server';

const typeDefs = gql`

    enum EconomicEntityType {
        BUSINESS
    }

    type Sentiment @key(fields: "businessName") {
        businessName: String!
        score: Int
        comparative: Float
    }

    type CollectEconomicDataResponse {
        success: Boolean!
    }

    extend type Mutation {
        collectEconomicData(entityName: String!, entityType: EconomicEntityType!): CollectEconomicDataResponse!
    }

    # This comment is to track important practices when defining mutations.
    # - It's recommended to return a type designed specifically for mutations (i.e, a theoretical AddBusiness(...): UpdateBusinessResponse).
    # - Return modified objects in response so that UI can apply updates to cache, etc without additional query.
    # type Mutation {
    # }
`;

export { typeDefs };