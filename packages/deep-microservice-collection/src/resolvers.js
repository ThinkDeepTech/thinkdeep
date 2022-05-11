const resolvers = {
  Query: {
    tweets: async (
      _,
      {economicEntityName, economicEntityType},
      {dataSources, permissions}
    ) =>
      dataSources.collectionService.tweets(
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
      dataSources.collectionService.collectEconomicData(
        economicEntityName,
        economicEntityType,
        permissions
      ),
  },
};

export {resolvers};
