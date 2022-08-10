import {EconomicEntityFactory} from '@thinkdeep/model';

const resolvers = {
  Mutation: {
    collectEconomicData: async (
      _,
      {economicEntities},
      {dataSources, permissions}
    ) =>
      dataSources.collectionService.collectEconomicData(
        EconomicEntityFactory.get(economicEntities),
        permissions
      ),
  },
};

export {resolvers};
