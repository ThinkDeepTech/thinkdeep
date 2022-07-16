import {GraphQLScalarType, Kind} from 'graphql';
import moment from 'moment';

const dateScalar = new GraphQLScalarType({
  name: 'Date',
  description: 'Date custom scalar type.',
  serialize(value) {
    return moment.utc(value);
  },
  parseValue(value) {
    return moment.utc(value);
  },
  parseLiteral(ast) {
    if (ast.kind === Kind.STRING) {
      return moment.utc(ast.value);
    }
    return null; // Invalid hard-coded value
  },
});

export {dateScalar};
