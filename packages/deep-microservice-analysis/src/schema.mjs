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

    type GetSentimentResponse {
        entityName: String!
        sentiments: [Sentiment!]!
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
        search(businessName: String!): [EconomicEntity]!,
        getSentiment(economicEntityName: String!, economicEntityType: EconomicEntityType!): GetSentimentResponse!
    }
`;

export { typeDefs };