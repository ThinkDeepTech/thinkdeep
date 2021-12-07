
const resolvers = {
    Query: {
        search: (_, {businessName}, { dataSources, user }) => dataSources.analysisService.getBusinessRelationships(businessName, user),
        getSentiment: (_, {economicEntityName, economicEntityType}, { dataSources, user}) => dataSources.analysisService.getSentiment(economicEntityName, economicEntityType)
    },
    EconomicEntity: {
        _resolveReference(object, { dataSources }) {
            return dataSources.analysisService.getBusinessRelationships(object.name);
        }
    }
};

export { resolvers };