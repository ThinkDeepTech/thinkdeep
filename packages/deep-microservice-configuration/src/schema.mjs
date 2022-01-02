import { gql } from 'apollo-server';

const typeDefs = gql`

    enum EconomicEntityType {
        BUSINESS
    }

    # The site configuration associated with a given user.
    type Configuration {
        observedEconomicEntities: [EconomicEntity!]!
    }

    input EconomicEntityInput {
        name: String!
        type: EconomicEntityType!
    }

    type EconomicEntity {
        name: String!
        type: EconomicEntityType!
    }

    extend type Mutation {

        # Fetch or create the site config.
        configuration(userEmail: String!): Configuration!

        updateConfiguration(userEmail: String!, observedEconomicEntities: [EconomicEntityInput!]!): Configuration!
    }
`;

export { typeDefs };