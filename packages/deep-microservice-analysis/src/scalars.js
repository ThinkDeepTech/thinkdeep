import {GraphQLScalarType, Kind} from 'graphql';
import moment from 'moment';

/**
 * Validate UTC date time string.
 * @param {String} utcDateTime UTC date time.
 * @return {String} UTC date time string if valid.
 */
const _date = (utcDateTime) => {
  const subject = moment.utc(utcDateTime);

  if (!subject.isValid()) {
    throw new Error(`A UTC date time is required.`);
  }

  return subject.format();
};

const dateScalar = new GraphQLScalarType({
  name: 'Date',
  description: 'Date custom scalar type.',
  serialize(value) {
    return _date(value);
  },
  parseValue(value) {
    return _date(value);
  },
  parseLiteral(ast) {
    if (ast.kind === Kind.STRING) {
      return _date(ast.value);
    }
    return null; // Invalid hard-coded value
  },
});

export {dateScalar};
