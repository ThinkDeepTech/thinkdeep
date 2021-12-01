
const resolvers = {
    Query: {
        search: (_, {businessName}, { dataSources, user }) => dataSources.analysisService.getSentiment(businessName, user)
    },
    Sentiment: {
        _resolveReference(object, { dataSources, user }) {
            return dataSources.analysisService.getSentiment(object.businessName, user);
        }
    }
};

export { resolvers };