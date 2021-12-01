import { gql } from 'apollo-server';

const typeDefs = gql`

    type Sentiment @key(fields: "businessName") {
        businessName: String!
        score: Int,
        comparative: Float
    }

    extend type Query {
        getSentiment(businessName: String!): [Sentiment!]!
    }

    # This comment is to track important practices when defining mutations.
    # - It's recommended to return a type designed specifically for mutations (i.e, a theoretical AddBusiness(...): UpdateBusinessResponse).
    # - Return modified objects in response so that UI can apply updates to cache, etc without additional query.
    # type Mutation {
    # }
`;

export { typeDefs };