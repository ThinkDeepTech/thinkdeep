
const resolvers = {
    Mutation: {
        user: async(_, __, {dataSources, permissions, me}) => dataSources.userService.getOrCreateUser(permissions),

        updateUser: async (_, {observedEconomicEntities}, {dataSources, permissions, me}) => dataSources.userService.updateUser(observedEconomicEntities, permissions)
    }
};

export { resolvers };