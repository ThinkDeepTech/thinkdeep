
/**
 * Check whether the permissions object is valid.
 * @param {Object} permissions - Permissions object.
 * @return {Boolean} - True if the user object is valid. False otherwise.
 */
const isValidPerm = (permissions) => {
    return !!permissions && !!Object.keys(permissions).length && !!permissions?.scope;
}

/**
 * Determine if the user has read all access.
 * @param {Object} permissions - User permissions
 * @return {Boolean} - True if the user has read:all scope. False otherwise.
 */
const hasReadAllAccess = (permissions) => {
    return isValidPerm(permissions) && !!permissions?.scope?.split(' ').includes('read:all');
};

export { hasReadAllAccess , isValidPerm};