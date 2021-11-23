
const resolvers = {
    Query: {
        search: (_, {businessName}, { dataSources }) => dataSources.db.search(businessName)
    }
};

export { resolvers };