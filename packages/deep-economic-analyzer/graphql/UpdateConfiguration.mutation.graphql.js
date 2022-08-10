import {gql} from 'graphql-tag';
import {EconomicEntityFactory, EconomicEntityType} from '@thinkdeep/model';

const economicEntity = EconomicEntityFactory.get({
  name: 'dummy',
  type: EconomicEntityType.Business,
});

const UpdateConfiguration = gql`mutation UpdateConfiguration ($userEmail: String!, $observedEconomicEntities: [${economicEntity.graphQLInputType()}!]!){
  updateConfiguration(userEmail: $userEmail, observedEconomicEntities: $observedEconomicEntities) {
    observedEconomicEntities {
      name
      type
    }
  }
}`;

export {UpdateConfiguration};
