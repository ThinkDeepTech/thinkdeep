import {gql} from 'apollo-server';
import {EconomicEntityFactory, EconomicEntityType} from '@thinkdeep/model';

const economicEntity = EconomicEntityFactory.economicEntity({
  name: 'dummy',
  type: EconomicEntityType.Business,
});

const typeDefs = gql`

  # The site configuration associated with a given user.
  type Configuration {
    observedEconomicEntities: [${economicEntity.graphQLType()}!]!
  }

  ${economicEntity.graphQLDependencyTypeDefinitions()}

  ${economicEntity.graphQLTypeDefinition()}

  ${economicEntity.graphQLInputTypeDefinition()}

  extend type Mutation {
    # Fetch or create the site config.
    configuration(userEmail: String!): Configuration!

    updateConfiguration(
      userEmail: String!
      observedEconomicEntities: [${economicEntity.graphQLInputType()}!]!
    ): Configuration!
  }
`;

export {typeDefs};
