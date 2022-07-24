import {html, expect} from '@open-wc/testing';
import {
  input,
  click,
  select,
  fixtureSync,
  wait,
} from '@thinkdeep/tools/test-helper.js';
import {
  collectDataButton,
  collectDataInput,
  sentimentChart,
  analysisDropdownOption,
} from './deep-analyzer-page-summary-helpers.js';
import {initializeE2e} from './initialize-e2e.js';
import sinon from 'sinon';

import '../deep-analyzer-page-summary.js';

describe('deep-analyzer-page-summary', () => {
  beforeEach(async () => {
    await initializeE2e(
      process.env.PREDECOS_TEST_AUTH_PREMIUM_USERNAME,
      process.env.PREDECOS_TEST_AUTH_PREMIUM_PASSWORD
    );
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

  it('should allow users to select a business to analyze', async () => {
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

  it('should display a graph of sentiment vs date', async () => {
    const element = await fixtureSync(
      html`<deep-analyzer-page-summary></deep-analyzer-page-summary>`
    );

    const chart = sentimentChart(element);

    const founds = chart.cols.map(
      (col) =>
        col.label.toLowerCase().includes('date') ||
        col.label.toLowerCase().includes('comparative score')
    );
    for (const found of founds) {
      expect(found).to.equal(true);
    }
    expect(founds.length).to.be.greaterThan(0);
  });

  it('should redraw the sentiment graph when the screen is resized', async () => {
    const element = await fixtureSync(
      html`<deep-analyzer-page-summary></deep-analyzer-page-summary>`
    );

    const chart = sentimentChart(element);

    sinon.spy(chart, 'redraw');

    expect(chart.redraw.callCount).to.equal(0);

    element.dispatchEvent(
      new UIEvent('resize', {
        bubbles: true,
      })
    );

    await wait(4000);

    expect(chart.redraw.callCount).to.be.greaterThan(0);
  });
});
