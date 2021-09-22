/**
 * Sleep for the specified number of milliseconds.
 * @param {Number} milliseconds
 */
function sleep(milliseconds) {
    return new Promise((r) => setTimeout(r, milliseconds));
}

export {
    sleep
};