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

/**
 * Determine if a url is valid
 * @param {String} subject
 * @return {Boolean} True if valid. False otherwise.
 */
const validUrl = (subject) => {
  let url;
  try {
    url = new URL(subject);
  } catch (_) {
    return false;
  }

  return url.protocol === 'http:' || url.protocol === 'https:';
};

export {validString, validUrl};
