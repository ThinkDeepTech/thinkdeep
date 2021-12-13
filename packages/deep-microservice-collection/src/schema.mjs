import { gql } from 'apollo-server';

const typeDefs = gql`

    enum EconomicEntityType {
        BUSINESS
    }

    type CollectEconomicDataResponse {
        success: Boolean!
    }

    type TimeSeriesTweets {
        timestamp: Int!
        tweets: [Tweet!]!
    }

    type Tweet {
        text: String!
    }

    extend type Query {
        tweets(economicEntityName: String!, economicEntityType: EconomicEntityType!): [TimeSeriesTweets!]!
    }

    extend type Mutation {
        collectEconomicData(economicEntityName: String!, economicEntityType: EconomicEntityType!): CollectEconomicDataResponse!
    }
`;

export { typeDefs };