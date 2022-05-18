import {html, expect} from '@open-wc/testing';
import {
  delayForPageRender,
  input,
  click,
  select,
  fixtureSync,
  wait,
} from '@thinkdeep/tools/test-helper.js';
import {initializeE2e} from './initialize-e2e.js';

import '../deep-analyzer-page-summary.js';

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
 * Get the specified analysis dropdown option element.
 * @param {Element} element Parent element of the drop down.
 * @param {String} value Dropdown option value.
 * @return {Element} Element with a matching value.
 */
const analysisDropdownOption = (element, value) => {
  const analysisOptions = element.shadowRoot.querySelectorAll(
    'mwc-select > mwc-list-item'
  );

  let target = null;
  for (const option of analysisOptions) {
    if (option.value === value) {
      target = option;
    }
  }

  if (!target) {
    throw new Error(
      `Failed to find analysis dropdown target with value: ${value}`
    );
  }

  return target;
};

/**
 * Get sentiment chart.
 * @param {HTMLElement} element Ancestor element.
 * @return {HTMLElement} The html element.
 */
const sentimentChart = (element) => {
  return element.shadowRoot.querySelector('google-chart');
};

/**
 * Select a point on the specified chart.
 *
 * @param {Element} targetChart Chart element on which selection will occur.
 * @param {Array<Number>} point Array of size two of the form [x, y].
 */
const selectChartValue = async (targetChart, point) => {
  const selections = [];

  for (let i = 0; i < targetChart.rows.length; i++) {
    const prospectivePoint = targetChart.rows[i];
    if (point[0] === prospectivePoint[0] && point[1] === prospectivePoint[1]) {
      selections.push({row: i, column: 0});
    }
  }

  targetChart.selection = selections;

  // NOTE: Keep this synced with google chart to ensure correctness.
  targetChart.dispatchEvent(
    new CustomEvent(`google-chart-select`, {
      bubbles: true,
      composed: true,
      detail: {
        // Events fire after `chartWrapper` is initialized.
        chart: targetChart,
      },
    })
  );

  await delayForPageRender();
};

/**
 * Get a list of tweets.
 * @param {Element} element Parent element with nested tweets.
 * @return {Array<Element>} The list of tweet elements.
 */
const tweetList = (element) => {
  return element.shadowRoot.querySelectorAll('.tweet');
};

describe('deep-analyzer-page-summary', () => {
  beforeEach(async () => {
    await initializeE2e();
  });

  it('should allow users to collect data for a desired business', async () => {
    // TODO: Delete desired business.

    const businessName = 'Moosehead';

    const element = await fixtureSync(
      html`<deep-analyzer-page-summary></deep-analyzer-page-summary>`
    );

    await input(collectDataInput(element), businessName);

    await click(collectDataButton(element));

    await select(analysisDropdownOption(element, businessName));

    const chart = sentimentChart(element);

    /**
     * Wait for back-end to process newly added option.
     */
    await wait(5000);

    for (const coordinates of chart.rows) {
      expect(coordinates.length).to.equal(2);
    }
    expect(chart.rows.length).to.be.greaterThan(0);
  });

  it('should allow users to analyze collected data', async () => {
    const element = await fixtureSync(
      html`<deep-analyzer-page-summary></deep-analyzer-page-summary>`
    );

    const chart = sentimentChart(element);

    for (const coordinates of chart.rows) {
      expect(coordinates.length).to.equal(2);
    }
    expect(chart.rows.length).to.be.greaterThan(0);
  });

  it('should allow users to select a business to alanyze', async () => {
    const businessName = 'Moosehead';

    const element = await fixtureSync(
      html`<deep-analyzer-page-summary></deep-analyzer-page-summary>`
    );

    await input(collectDataInput(element), businessName);

    await click(collectDataButton(element));

    await select(analysisDropdownOption(element, businessName));

    const chart = sentimentChart(element);

    /**
     * Wait for back-end to process newly added option.
     */
    await wait(5000);

    for (const coordinates of chart.rows) {
      expect(coordinates.length).to.equal(2);
    }
    expect(chart.rows.length).to.be.greaterThan(0);
  });

  it('should display a graph of sentiment vs time', async () => {
    const element = await fixtureSync(
      html`<deep-analyzer-page-summary></deep-analyzer-page-summary>`
    );

    const chart = sentimentChart(element);

    const founds = chart.cols.map(
      (col) =>
        col.label.toLowerCase().includes('time') ||
        col.label.toLowerCase().includes('sentiment')
    );
    for (const found of founds) {
      expect(found).to.equal(true);
    }
    expect(founds.length).to.be.greaterThan(0);
  });

  it('should display tweets when the user clicks on a point on the sentiment graph', async () => {
    const element = await fixtureSync(
      html`<deep-analyzer-page-summary></deep-analyzer-page-summary>`
    );

    const chart = sentimentChart(element);

    const pointOnGraph = chart.rows[0] || null;

    if (!pointOnGraph) {
      throw new Error(`There were no sentiment graph points available.`);
    }

    await selectChartValue(chart, pointOnGraph);

    const tweetSection = tweetList(element);

    expect(tweetSection.length).to.be.greaterThan(0);
  });
});
