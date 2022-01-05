
/**
 * Determine whether a string is defined and hydrated.
 * @param {Object} val - Any object.
 * @returns {Boolean} True if the value is a non-empty string. False otherwise.
 */
const validString = (val) => {
    return !!val && (typeof val === 'string');
};

export { validString };