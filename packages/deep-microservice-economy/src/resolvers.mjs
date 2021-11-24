
const resolvers = {
    Query: {
        search: (_, {businessName}, { dataSources }) => dataSources.economyService.getBusinessRelationships(businessName)
    },
    EconomicEntity: {
        _resolveReference(object, { dataSources }) {
            return dataSources.economyService.getBusinessRelationships(object.name);
        }
    }
};

export { resolvers };