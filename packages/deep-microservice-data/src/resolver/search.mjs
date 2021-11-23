
const search = (_, {businessName}, { dataSources }) => dataSources.db.search(businessName);

export { search };