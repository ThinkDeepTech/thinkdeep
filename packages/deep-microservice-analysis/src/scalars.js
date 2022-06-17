import {GraphQLScalarType, Kind} from 'graphql';
import moment from 'moment';

const dateScalar = new GraphQLScalarType({
  name: 'Date',
  description: 'Date custom scalar type.',
  serialize(value) {
    return moment(value).unix();
  },
  parseValue(value) {
    return moment(value).unix();
  },
  parseLiteral(ast) {
    if (ast.kind === Kind.INT) {
      return moment(parseInt(ast.value, 10)).unix();
    }
    return null; // Invalid hard-coded value (not an integer)
  },
});

export {dateScalar};
