
const resolvers = {
    Query: {
        sentiments: async (_, {economicEntityName, economicEntityType}, { dataSources, user}) => await dataSources.analysisService.sentiments(economicEntityName, economicEntityType, user)
    }
};

export { resolvers };