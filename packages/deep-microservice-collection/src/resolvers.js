const resolvers = {
  Query: {
    tweets: async (
      _,
      {economicEntityName, economicEntityType},
      {dataSources, permissions}
    ) =>
      await dataSources.collectionService.tweets(
        economicEntityName,
        economicEntityType,
        permissions
      ),
  },
  Mutation: {
    collectEconomicData: async (
      _,
      {economicEntityName, economicEntityType},
      {dataSources, permissions}
    ) =>
      await dataSources.collectionService.collectEconomicData(
        economicEntityName,
        economicEntityType,
        permissions
      ),
  },
};

export {resolvers};
