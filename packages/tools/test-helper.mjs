/**
 * Sleep for the specified number of milliseconds.
 * @param {Number} milliseconds
 */
function sleep(milliseconds) {
    return new Promise((r) => setTimeout(r, milliseconds));
}

/**
 * Wait for the specified number of milliseconds.
 * @param {Number} milliseconds
 */
const wait = async (milliseconds) => {
    await sleep(milliseconds);
};

/**
 * Delay the specified number of milliseconds to ensure page renders.
 *
 * NOTE: Mocha configurations aren't currently being recognized by web test runner in circleci.
 * This results in a timeout after 2000 ms despite the timeout being set to a larger value. As a
 * result, this delay is used to better ensure render but it must account for multiple renders.
 * Therefore, a value << 2000 ms is ideal.
 */
const delayForPageRender = async () => {
    await wait(1200);
};

/**
 * Get the path specified at the end of the href of an anchor tag.
 * @param {HTMLElement} anchor
 * @returns {String} The string component occuring after the host and port (i.e, https://localhost:4000/graphql would return 'graphql').
 */
const path = (anchor) => {
    const href = anchor.href;
    const components = href.split('/');
    return components[3];
};

export {
    delayForPageRender,
    path,
    wait,
    sleep
};