
const resolvers = {
    Mutation: {
        configuration: async(_, {userEmail}, {dataSources, permissions}) => dataSources.configurationService.getOrCreateConfiguration(userEmail, permissions),

        updateConfiguration: async (_, {userEmail, observedEconomicEntities}, {dataSources, permissions}) => dataSources.configurationService.updateConfiguration(userEmail, observedEconomicEntities, permissions)
    }
};

export { resolvers };