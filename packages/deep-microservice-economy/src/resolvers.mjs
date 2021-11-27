
const resolvers = {
    Query: {
        search: (_, {businessName}, { dataSources, user }) => dataSources.economyService.getBusinessRelationships(businessName, user)
    },
    EconomicEntity: {
        _resolveReference(object, { dataSources }) {
            return dataSources.economyService.getBusinessRelationships(object.name);
        }
    }
};

export { resolvers };