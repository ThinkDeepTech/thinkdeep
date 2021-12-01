
const resolvers = {
    Query: {
        getSentiment: async (_, {businessName}, { dataSources, user }) => await dataSources.analysisService.getSentiment(businessName, user)
    },
    Sentiment: {
        _resolveReference: async (object, { dataSources }) => {
            // TODO: Update
            return dataSources.analysisService.getSentiment(object.businessName);
        }
    }
};

export { resolvers };