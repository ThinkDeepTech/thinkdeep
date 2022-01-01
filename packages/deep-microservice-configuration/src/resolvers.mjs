
const resolvers = {
    Mutation: {
        configuration: async(_, {userEmail}, {dataSources, permissions}) => await dataSources.configurationService.getOrCreateConfiguration(userEmail, permissions),

        updateConfiguration: async (_, {userEmail, observedEconomicEntities}, {dataSources, permissions}) => await dataSources.configurationService.updateConfiguration(userEmail, observedEconomicEntities, permissions)
    }
};

export { resolvers };