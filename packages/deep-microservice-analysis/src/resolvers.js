const resolvers = {
  Query: {
    sentiments: async (
      _,
      {economicEntityName, economicEntityType},
      {dataSources, permissions}
    ) =>
      await dataSources.analysisService.sentiments(
        economicEntityName,
        economicEntityType,
        permissions
      ),
  },
};

export {resolvers};
