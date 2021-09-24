import { gql } from 'apollo-server';

const typeDefs = gql`
    type Data {
        id: ID!
        name: String
    }
`;

export default typeDefs;