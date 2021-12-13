
const resolvers = {
    Query: {
        tweets: async (_, {economicEntityName, economicEntityType}, { dataSources, user }) => await dataSources.collectionService.tweets(economicEntityName, economicEntityType, user)
    },
    Mutation: {
        collectEconomicData: async (_, {economicEntityName, economicEntityType}, { dataSources, user }) => await dataSources.collectionService.collectEconomicData(economicEntityName, economicEntityType, user)
    }
};

export { resolvers };