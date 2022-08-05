import {gql} from 'graphql-tag';
import {EconomicEntityFactory, EconomicEntityType} from '@thinkdeep/model';

const economicEntity = EconomicEntityFactory.economicEntity({
  name: 'dummy',
  type: EconomicEntityType.Business,
});

const GetSentiment = gql`
query GetSentiment($economicEntities: [${economicEntity.graphQLInputType()}!]!, $startDate: Date!, $endDate: Date) {
  getSentiments(economicEntities: $economicEntities, startDate: $startDate, endDate: $endDate) {
      utcDateTime
      comparative
      tweets {
        text
      }
  }
}
`;

export {GetSentiment};
