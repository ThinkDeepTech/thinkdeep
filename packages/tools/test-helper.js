/**
 * Sleep for the specified number of milliseconds.
 * @param {Number} milliseconds
 * @return {Promise<void>} Resolves after time passes.
 */
function sleep(milliseconds) {
  return new Promise((resolve) => setTimeout(resolve, milliseconds));
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
  await wait(1500);
};

export {delayForPageRender, wait, sleep};
