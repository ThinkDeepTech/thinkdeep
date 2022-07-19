import {dateScalar} from './scalars.js';

const resolvers = {
  Date: dateScalar,
  Query: {
    getSentiments: async (
      _,
      {economicEntities, startDate, endDate, limit},
      {dataSources, permissions}
    ) =>
      dataSources.analysisService.sentiments(
        economicEntities,
        startDate,
        endDate,
        limit,
        permissions
      ),
  },
};

export {resolvers};
