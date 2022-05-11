const resolvers = {
  Mutation: {
    configuration: async (_, {userEmail}, {dataSources, permissions, me}) =>
      dataSources.configurationService.getOrCreateConfiguration(
        userEmail,
        permissions,
        me
      ),

    updateConfiguration: async (
      _,
      {userEmail, observedEconomicEntities},
      {dataSources, permissions, me}
    ) =>
      dataSources.configurationService.updateConfiguration(
        userEmail,
        observedEconomicEntities,
        permissions,
        me
      ),
  },
};

export {resolvers};
