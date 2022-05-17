import {html, litFixtureSync, expect} from '@open-wc/testing';
import {delayForPageRender} from '@thinkdeep/tools/test-helper.js';
// import { translate } from 'lit-element-i18n';
// import sinon from 'sinon';

import '../deep-analyzer-page-summary.js';
import {initializeE2e} from './initialize-e2e.js';

/**
 * Get collect data textfield.
 * @param {HTMLElement} element Ancestor element.
 * @return {HTMLElement} The html element.
 */
const collectDataInput = (element) => {
  return element.shadowRoot.querySelector('mwc-textfield');
};

/**
 * Get collect data button.
 * @param {HTMLElement} element Ancestor element.
 * @return {HTMLElement} The html element.
 */
const collectDataButton = (element) => {
  return element.shadowRoot.querySelector('mwc-button');
};

/**
 * Get sentiment chart.
 * @param {HTMLElement} element Ancestor element.
 * @return {HTMLElement} The html element.
 */
const sentimentChart = (element) => {
  return element.shadowRoot.querySelector('google-chart');
};

describe('deep-analyzer-page-summary', () => {
  beforeEach(async () => {
    await initializeE2e();
  });

  it.only('should allow users to collect data for a desired business', async () => {
    // TODO: Delete desired business.

    const element = await litFixtureSync(
      html`<deep-analyzer-page-summary></deep-analyzer-page-summary>`
    );

    await delayForPageRender();

    const collectInput = collectDataInput(element);

    collectInput.value = 'Oracle';

    collectInput.dispatchEvent(new Event('input'));

    await delayForPageRender();

    const collectButton = collectDataButton(element);

    collectButton.click();

    await delayForPageRender();

    const chart = sentimentChart(element);

    await delayForPageRender();

    expect(chart.rows.length).to.be.greaterThan(0);
  });

  it('should allow users to analyze collected data', () => {});

  it('should allow users to select analysis for a business that was just collected', () => {});

  it('should display a graph of sentiment vs time', () => {});

  it('should display tweets when the user clicks on a point on the sentiment graph', () => {});
});
