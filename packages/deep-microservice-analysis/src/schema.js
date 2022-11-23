import {gql} from 'apollo-server';
import {EconomicEntityType, EconomicEntityFactory} from '@thinkdeep/model';

const economicEntity = EconomicEntityFactory.get({
  name: 'dummy',
  type: EconomicEntityType.Business,
});

const typeDefs = gql`
  scalar Date

  type SentimentResult {
    utcDateTime: Date!
    comparative: Float!
    tweets: [Tweet!]!
  }

  type Tweet {
    text: String!
  }

  ${economicEntity.graphQLDependencyTypeDefinitions()}

  ${economicEntity.graphQLTypeDefinition()}

  ${economicEntity.graphQLInputTypeDefinition()}

  extend type Query {
    getSentiments(
      economicEntities: [${economicEntity.graphQLInputType()}!]!
      startDate: Date!
      endDate: Date
    ): [[SentimentResult!]!]!
  }
`;

export {typeDefs};
