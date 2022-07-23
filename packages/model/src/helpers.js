/**
 * Check if value is a string.
 * @param {any} val
 * @return {Boolean} True if a string. False otherwise.
 */
const isString = (val) => {
  return !!val && (typeof val === 'string' || val instanceof String);
};

/**
 * Determine if a string is valid.
 * @param {String} str
 * @return {Boolean} True if valid. False otherwise.
 */
const validString = (str) => {
  return isString(str) && str.length > 0;
};

export {validString};
