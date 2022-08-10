import {gql} from 'graphql-tag';
import {EconomicEntityFactory, EconomicEntityType} from '@thinkdeep/model';

const economicEntity = EconomicEntityFactory.get({
  name: 'dummy',
  type: EconomicEntityType.Business,
});

const CollectEconomicData = gql`mutation CollectEconomicData($economicEntities: [${economicEntity.graphQLInputType()}!]!){
  collectEconomicData(economicEntities: $economicEntities) {
    success
  }
}`;

export {CollectEconomicData};
