import {litFixtureSync} from '@open-wc/testing';

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
 */
const delayForPageRender = async () => {
  await wait(3000);
};

/**
 * Input a value into an element.
 * @param {HTMLElement} target Target html element.
 * @param {any} value Value to assign to target.
 */
const input = async (target, value) => {
  target.value = value;
  target.dispatchEvent(new Event('input'));
  await delayForPageRender();
};

/**
 * Click the element.
 * @param {Element} target Element to click.
 */
const click = async (target) => {
  target.click();

  await delayForPageRender();
};

/**
 * Select the specified element.
 *
 * NOTE: This adds the selected attribute to the element simulating selection.
 *
 * @param {Element} target Target element to select.
 */
const select = async (target) => {
  target.setAttribute('selected', '');

  await delayForPageRender();
};

/**
 * Create an element fixture for testing.
 * @param {TemplateResult} template Lit template result from markup.
 * @return {Element} Element stamped into the dom.
 */
const fixtureSync = async (template) => {
  const element = await litFixtureSync(template);

  await delayForPageRender();

  return element;
};

/**
 * Resize the window.
 * @param {Number} width
 * @param {Number} height
 * @return {Promise<void>} Promise that resolves after wait to resize.
 */
const resizeWindow = async (width, height) => {
  window.resizeTo(width, height);

  await delayForPageRender();
};

/**
 * Resize the window to mobile proportions.
 * @return {Promise<void>} Promise that resolves after wait to resize.
 */
const resizeWindowToMobile = async () => {
  await resizeWindow(390, 740);
};

/**
 * Resize the window to tablet proportions.
 * @return {Promise<void>} Promise that resolves after wait to resize.
 */
const resizeWindowToTablet = async () => {
  await resizeWindow(820, 1180);
};

/**
 * Resize the window to desktop proportions.
 * @return {Promise<void>} Promise that resolves after wait to resize.
 */
const resizeWindowToDesktop = async () => {
  await resizeWindow(1025, 1200);
};

export {
  delayForPageRender,
  wait,
  sleep,
  input,
  click,
  select,
  fixtureSync,
  resizeWindowToMobile,
  resizeWindowToTablet,
  resizeWindowToDesktop,
};
