import {EconomicEntityFactory} from '@thinkdeep/type';

const resolvers = {
  Mutation: {
    collectEconomicData: async (
      _,
      {economicEntities},
      {dataSources, permissions}
    ) =>
      dataSources.collectionService.collectEconomicData(
        EconomicEntityFactory.economicEntities(economicEntities),
        permissions
      ),
  },
};

export {resolvers};
