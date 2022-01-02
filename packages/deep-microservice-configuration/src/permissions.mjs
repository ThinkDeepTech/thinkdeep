
/**
 * Check whether the permissions object is valid.
 * @param {Object} permissions - Permissions subject.
 * @return {Boolean} - True if the user object is valid. False otherwise.
 */
const isValidPerm = (permissions) => {
    return !!permissions && !!Object.keys(permissions).length && !!permissions?.scope;
}

const isValidMe = (me) => {
    return !!me && !!me?.email;
}

/**
 * Determine if the user has read all access.
 * @param {Object} permissions - Permissions object taken from access token.
 * @return {Boolean} - True if the user has read:all scope. False otherwise.
 */
const hasReadAllAccess = (permissions) => {
    return isValidPerm(permissions) && !!permissions?.scope?.split(' ').includes('read:all');
};

const isCurrentUser = (userEmail, me) => {
    if (!isValidMe(me)) return false;
    const sameEmail = userEmail.toLowerCase() === me.email.toLowerCase();
    return sameEmail;
};

export { hasReadAllAccess, isCurrentUser};