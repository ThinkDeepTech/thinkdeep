import {dateScalar} from './scalars.js';
import {EconomicEntityFactory} from '@thinkdeep/model';

const resolvers = {
  Date: dateScalar,
  Query: {
    getSentiments: async (
      _,
      {economicEntities, startDate, endDate},
      {dataSources, permissions}
    ) =>
      dataSources.analysisService.sentiments(
        EconomicEntityFactory.get(economicEntities),
        startDate,
        endDate,
        permissions
      ),
  },
};

export {resolvers};
