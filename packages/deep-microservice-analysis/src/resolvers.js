import {dateScalar} from './scalars.js';
import {EconomicEntityFactory} from '@thinkdeep/type';

const resolvers = {
  Date: dateScalar,
  Query: {
    getSentiments: async (
      _,
      {economicEntities, startDate, endDate},
      {dataSources, permissions}
    ) =>
      dataSources.analysisService.sentiments(
        EconomicEntityFactory.economicEntities(economicEntities),
        startDate,
        endDate,
        permissions
      ),
  },
};

export {resolvers};
