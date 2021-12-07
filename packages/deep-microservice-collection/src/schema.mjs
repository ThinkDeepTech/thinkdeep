import { gql } from 'apollo-server';

const typeDefs = gql`

    enum EconomicEntityType {
        BUSINESS
    }

    type CollectEconomicDataResponse {
        success: Boolean!
    }

    type GetTweetsResponse {
        economicEntityName: String!
        economicEntityType: String!
        timeSeries: [TimeSeriesTweets!]!
    }

    type TimeSeriesTweets {
        timestamp: Int!
        tweets: [Tweet!]!
    }

    type Tweet {
        text: String!
    }

    extend type Query {
        getTweets(economicEntityName: String!, economicEntityType: EconomicEntityType!): GetTweetsResponse!
    }

    extend type Mutation {
        collectEconomicData(economicEntityName: String!, economicEntityType: EconomicEntityType!): CollectEconomicDataResponse!
    }
`;

export { typeDefs };