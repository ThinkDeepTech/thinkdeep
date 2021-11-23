
const search = (_, {businessName}, { dataSources }) => dataSources.db.searchBusinesses(businessName);

export { search };