
const resolvers = {
    Query: {
        getTweets: async (_, {economicEntityName, economicEntityType}, { dataSources, user }) => await dataSources.collectionService.getTweets(economicEntityName, economicEntityType, user)
    },
    Mutation: {
        collectEconomicData: async (_, {economicEntityName, economicEntityType}, { dataSources, user }) => await dataSources.collectionService.collectEconomicData(economicEntityName, economicEntityType, user)
    },
    // Sentiment: {
    //     _resolveReference: async ({entityName, entityType}, { dataSources, user }) => {
    //         return dataSources.collectionService.collectEconomicData(entityName, entityType, user);
    //     }
    // }
};

export { resolvers };