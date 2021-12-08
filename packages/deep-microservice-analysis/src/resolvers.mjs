
const resolvers = {
    Query: {
        search: async (_, {businessName}, { dataSources, user }) => dataSources.analysisService.getBusinessRelationships(businessName, user),
        getSentiment: async (_, {economicEntityName, economicEntityType}, { dataSources, user}) => await dataSources.analysisService.getSentiment(economicEntityName, economicEntityType, user)
    },
    EconomicEntity: {
        _resolveReference(object, { dataSources }) {
            return dataSources.analysisService.getBusinessRelationships(object.name);
        }
    }
};

export { resolvers };