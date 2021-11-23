import { gql } from 'apollo-server';

const typeDefs = gql`

    enum EntityType {
        BUSINESS
    }

    type EconomicEntity {
        id: ID!
        name: String!
        first: Int
        second: Int
    }

    type Query {
        search(businessName: String!): [EconomicEntity]!
    }

    # This comment is to track important practices when defining mutations.
    # - It's recommended to return a type designed specifically for mutations (i.e, a theoretical AddBusiness(...): UpdateBusinessResponse).
    # - Return modified objects in response so that UI can apply updates to cache, etc without additional query.
    # type Mutation {
    # }
`;

export { typeDefs };