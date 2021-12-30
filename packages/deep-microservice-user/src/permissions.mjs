
/**
 * Check whether the user object is valid.
 * @param {Object} user - User subject.
 * @return {Boolean} - True if the user object is valid. False otherwise.
 */
const isValidUser = (user) => {
    return !!user && !!Object.keys(user).length && !!user?.scope;
}

/**
 * Determine if the user has read all access.
 * @param {Object} user - User subject.
 * @return {Boolean} - True if the user has read:all scope. False otherwise.
 */
const hasReadAllAccess = (user) => {
    return isValidUser(user) && !!user?.scope?.split(' ').includes('read:all');
};

export { hasReadAllAccess , isValidUser};