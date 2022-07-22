import {gql} from 'apollo-server';
import {EconomicEntityFactory, EconomicEntityType} from '@thinkdeep/type';

const economicEntity = EconomicEntityFactory.economicEntity({
  name: 'dummy',
  type: EconomicEntityType.Business,
});

const typeDefs = gql`

  ${economicEntity.graphQLDependencyTypeDefinitions()}

  ${economicEntity.graphQLInputTypeDefinition()}

  type CollectEconomicDataResponse {
    success: Boolean!
  }

  extend type Mutation {
    collectEconomicData(
      economicEntities: [${economicEntity.graphQLInputType()}!]!
    ): CollectEconomicDataResponse!
  }
`;

export {typeDefs};
