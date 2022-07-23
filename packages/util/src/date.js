import moment from 'moment';

/**
 * Determine if a date is valid.
 * @param {any} val
 * @return {Boolean} True if valid. False otherwise.
 */
const validDate = (val) => {
  const _moment = moment(val);
  return _moment.isValid();
};

export {validDate};
