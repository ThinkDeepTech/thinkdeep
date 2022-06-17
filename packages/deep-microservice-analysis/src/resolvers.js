import {dateScalar} from './scalars.js';

const resolvers = {
  Date: dateScalar,
  Query: {
    // sentiments: async (
    //   _,
    //   {economicEntityName, economicEntityType},
    //   {dataSources, permissions}
    // ) =>
    //   dataSources.analysisService.sentiments(
    //     economicEntityName,
    //     economicEntityType,
    //     permissions
    //   ),
    sentiments: async (
      _,
      {economicEntityName, economicEntityType},
      {dataSources, permissions}
    ) => [],
  },
};

export {resolvers};
