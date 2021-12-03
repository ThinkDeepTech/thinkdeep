
const resolvers = {
    Query: {
        search: (_, {businessName}, { dataSources, user }) => dataSources.economyService.getBusinessRelationships(businessName, user),
        getSentiment: (_, {economicEntityName, economicEntityType}, { dataSources, user}) => dataSources.economyService.getSentiment(economicEntityName, economicEntityType)
    },
    EconomicEntity: {
        _resolveReference(object, { dataSources }) {
            return dataSources.economyService.getBusinessRelationships(object.name);
        }
    }
};

export { resolvers };