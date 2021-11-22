import { gql } from 'apollo-server';

const typeDefs = gql`

    # This union will hold all economic node types. I.e, a business, organization
    union Node = Business | Person

    type Person {
        id: ID!
        name: String!
        relationships: [Node]
    }

    type Business {
        id: ID!
        name: String!
        relationships: [Node]
    }

    type Query {
        search(businessName: String!): [Node]!
    }

    # This comment is to track important practices when defining mutations.
    # - It's recommended to return a type designed specifically for mutations (i.e, a theoretical AddBusiness(...): UpdateBusinessResponse).
    # - Return modified objects in response so that UI can apply updates to cache, etc without additional query.
    # type Mutation {
    # }
`;

export default typeDefs;