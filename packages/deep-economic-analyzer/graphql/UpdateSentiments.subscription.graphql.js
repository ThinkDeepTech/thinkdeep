import {gql} from 'graphql-tag';
import {EconomicEntityFactory, EconomicEntityType} from '@thinkdeep/model';

const economicEntity = EconomicEntityFactory.economicEntity({
  name: 'dummy',
  type: EconomicEntityType.Business,
});

const UpdateSentiments = gql`subscription UpdateSentiments($economicEntities: [${economicEntity.graphQLInputType()}!]!, $startDate: Date!, $endDate: Date) {
  updateSentiments(economicEntities: $economicEntities, startDate: $startDate, endDate: $endDate) {
      utcDateTime
      comparative
      tweets {
        text
      }
  }
}`;

export {UpdateSentiments};
