
const resolvers = {
    Query: {
        search: (_, {businessName}, { dataSources }) => dataSources.pg.search(businessName)
    }
};

export {resolvers};