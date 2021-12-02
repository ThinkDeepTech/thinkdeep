
const resolvers = {
    Mutation: {
        collectEconomicData: async (_, {entityName, entityType}, { dataSources, user }) => await dataSources.collectionService.collectEconomicData(entityName, entityType, user)
    },
    Sentiment: {
        _resolveReference: async ({entityName, entityType}, { dataSources, user }) => {
            return dataSources.collectionService.collectEconomicData(entityName, entityType, user);
        }
    }
};

export { resolvers };