import { gql } from 'apollo-server';

const typeDefs = gql`

    enum EconomicEntityType {
        BUSINESS
    }

    type EconomicEntity @key(fields: "id") {
        id: ID!
        name: String!
        first: Int
        second: Int
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
        sentiments(economicEntityName: String!, economicEntityType: EconomicEntityType!): [Sentiment!]!
    }
`;

export { typeDefs };