import {dateScalar} from './scalars.js';

const resolvers = {
  Date: dateScalar,
  Query: {
    getSentiments: async (
      _,
      {economicEntities, startDate, endDate},
      {dataSources, permissions}
    ) =>
      dataSources.analysisService.sentiments(
        economicEntities,
        startDate,
        endDate,
        permissions
      ),
  },
};

export {resolvers};
