/**
 * Sleep for the specified number of milliseconds.
 * @param {Number} milliseconds
 */
function sleep(milliseconds) {
    return new Promise((r) => setTimeout(r, milliseconds));
}

const wait = async (milliseconds) => {
    await sleep(milliseconds);
};

const delayForPageRender = async () => {
    // NOTE: The test times out if it takes longer than 2000 ms to complete during the automated build. Therefore,
    // this wait value should be less than 2000 ms.
    await wait(600);
};

const path = (anchor) => {
    const href = anchor.href;
    const components = href.split('/');
    const pathComponent = components[3];
    return pathComponent;
};

export {
    delayForPageRender,
    path,
    wait,
    sleep
};