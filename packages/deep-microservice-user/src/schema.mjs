import { gql } from 'apollo-server';

const typeDefs = gql`

    enum EconomicEntityType {
        BUSINESS
    }

    type User {
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
        # NOTE: The user identity is passed using the id token.

        # Fetch or create the user.
        user: User!

        updateUser(observedEconomicEntities: [EconomicEntityInput!]!): User!
    }
`;

export { typeDefs };