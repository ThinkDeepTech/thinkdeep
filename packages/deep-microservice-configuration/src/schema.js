import {gql} from 'apollo-server';
import {EconomicEntityFactory, EconomicEntityType} from '@thinkdeep/type';

const economicEntity = EconomicEntityFactory.economicEntity(
  'dummy',
  EconomicEntityType.Business
);

const typeDefs = gql`

  # The site configuration associated with a given user.
  type Configuration {
    observedEconomicEntities: [${economicEntity.graphQLType()}!]!
  }

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
