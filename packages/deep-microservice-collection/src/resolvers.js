const resolvers = {
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
