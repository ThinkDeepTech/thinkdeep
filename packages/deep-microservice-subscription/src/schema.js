import {gql} from 'apollo-server';

import {EconomicEntityFactory, EconomicEntityType} from '@thinkdeep/model';

const economicEntity = EconomicEntityFactory.get({
  name: 'dummy',
  type: EconomicEntityType.Business,
});

const typeDefs = gql`
  type Subscription {
    updateSentiments(
      economicEntities: [${economicEntity.graphQLInputType()}!]!
      startDate: Date!
      endDate: Date
    ): SentimentResult!
  }
`;

export {typeDefs};
