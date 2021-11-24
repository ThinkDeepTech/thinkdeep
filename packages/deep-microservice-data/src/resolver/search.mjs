
const search = (_, {businessName}, { dataSources }) => dataSources.economyService.getBusinessRelationships(businessName);

export { search };