import {html, expect} from '@open-wc/testing';
import {EconomicEntityFactory, EconomicEntityType} from '@thinkdeep/model';
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
  startDate,
  endDate,
  analysisDropdownOption,
  unselectedDateOptions,
  datePickerOverlay,
  unselectedAnalysisDropdownOptions,
} from './deep-analyzer-page-summary-helpers.js';
import {initializeE2e} from './initialize-e2e.js';
import moment from 'moment/dist/moment.js';
import sinon from 'sinon';

import '../deep-analyzer-page-summary.js';

describe('deep-analyzer-page-summary', () => {
  let element;
  beforeEach(async () => {
    await initializeE2e(
      process.env.PREDECOS_TEST_AUTH_PREMIUM_USERNAME,
      process.env.PREDECOS_TEST_AUTH_PREMIUM_PASSWORD
    );

    element = await fixtureSync(
      html`<deep-analyzer-page-summary></deep-analyzer-page-summary>`
    );
  });

  afterEach(() => {
    sinon.restore();
  });

  it('should allow users to collect data for a desired business', async () => {
    // TODO: Delete desired business.

    const businessName = 'Moosehead';

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
    const businessName = 'Moosehead';

    await input(collectDataInput(element), businessName);

    await click(collectDataButton(element));

    await select(analysisDropdownOption(element, businessName));

    const chart = sentimentChart(element);

    for (const coordinates of chart.rows) {
      expect(coordinates.length).to.equal(2);
    }
    expect(chart.rows.length).to.be.greaterThan(0);
  });

  it('should allow users to select a business to analyze', async () => {
    const businessName = 'Moosehead';

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
    const businessName = 'Moosehead';

    await input(collectDataInput(element), businessName);

    await click(collectDataButton(element));

    await select(analysisDropdownOption(element, businessName));

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
    const businessName = 'Moosehead';

    await input(collectDataInput(element), businessName);

    await click(collectDataButton(element));

    await select(analysisDropdownOption(element, businessName));

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

  describe('analysis dropdown', () => {
    it('should update the subscription to the selected business', async () => {
      const unselectedDropdownOption =
        unselectedAnalysisDropdownOptions(element)[0];

      expect(!!unselectedDropdownOption).to.equal(true);

      await select(unselectedDropdownOption);

      const expectedEconomicEntity = EconomicEntityFactory.get({
        name: unselectedDropdownOption.value,
        type: EconomicEntityType.Business,
      });

      const actualEconomicEntity =
        element._sentimentSubscriptionController.variables.economicEntities[0];

      expect(expectedEconomicEntity.equals(actualEconomicEntity)).to.equal(
        true
      );
    });

    it('should update the sentiment query with the new economic entity', async () => {
      const unselectedDropdownOption =
        unselectedAnalysisDropdownOptions(element)[0];

      expect(!!unselectedDropdownOption).to.equal(true);

      await select(unselectedDropdownOption);

      const expectedEconomicEntity = EconomicEntityFactory.get({
        name: unselectedDropdownOption.value,
        type: EconomicEntityType.Business,
      });

      const actualEconomicEntity =
        element._sentimentQueryController.variables.economicEntities[0];

      expect(expectedEconomicEntity.equals(actualEconomicEntity)).to.equal(
        true
      );
    });

    it('should immediately fetch data associated with selected business', async () => {
      const unselectedDropdownOption =
        unselectedAnalysisDropdownOptions(element)[0];

      expect(!!unselectedDropdownOption).to.equal(true);

      sinon.spy(element._sentimentQueryController, 'executeQuery');

      await select(unselectedDropdownOption);

      expect(
        element._sentimentQueryController.executeQuery.callCount
      ).to.be.greaterThan(0);
    });
  });

  describe('start date', () => {
    it('should default to today minus one month', async () => {
      const dateComponent = startDate(element);

      expect(!!dateComponent).to.equal(true);

      const actualDate = dateComponent.value;

      expect(actualDate).to.equal(
        moment().utc().subtract(1, 'month').format('YYYY-MM-DD')
      );
    });

    it('should not allow clearing the date', async () => {
      expect(startDate(element).getAttribute('clear-button-visible')).to.equal(
        null
      );
    });

    it('should allow the user to select a new date', async () => {
      const dateComponent = startDate(element);

      await click(dateComponent);

      const unselectedDates = unselectedDateOptions(datePickerOverlay());

      const initialDateValue = dateComponent.value;

      await click(unselectedDates[1]);

      const subsequentDateValue = dateComponent.value;

      expect(!!initialDateValue).to.equal(true);
      expect(!!subsequentDateValue).to.equal(true);
      expect(initialDateValue).not.to.equal(subsequentDateValue);
      expect(moment.utc(subsequentDateValue).isValid()).to.equal(true);
    });

    it('should update the subscription query variables', async () => {
      const dateComponent = startDate(element);

      await click(dateComponent);

      const unselectedDates = unselectedDateOptions(datePickerOverlay());

      const initialDateValue = dateComponent.value;

      await click(unselectedDates[1]);

      const subsequentDateValue = dateComponent.value;

      expect(initialDateValue).not.to.equal(subsequentDateValue);
      expect(
        element._sentimentSubscriptionController.variables.startDate
      ).to.equal(`${subsequentDateValue}T00:00:00Z`);
    });

    it('should update the sentiment query variables', async () => {
      const dateComponent = startDate(element);

      await click(dateComponent);

      const unselectedDates = unselectedDateOptions(datePickerOverlay());

      const initialDateValue = dateComponent.value;

      await click(unselectedDates[1]);

      const subsequentDateValue = dateComponent.value;

      expect(initialDateValue).not.to.equal(subsequentDateValue);
      expect(element._sentimentQueryController.variables.startDate).to.equal(
        `${subsequentDateValue}T00:00:00Z`
      );
    });

    it('should query the api for new data', async () => {
      const dateComponent = startDate(element);

      await click(dateComponent);

      const unselectedDates = unselectedDateOptions(datePickerOverlay());

      sinon.spy(element._sentimentQueryController, 'executeQuery');

      await click(unselectedDates[1]);

      expect(
        element._sentimentQueryController.executeQuery.callCount
      ).to.be.greaterThan(0);
    });

    it('should include entities starting from the beginning of the day', async () => {
      const dateComponent = startDate(element);

      await click(dateComponent);

      const unselectedDates = unselectedDateOptions(datePickerOverlay());

      const initialDateValue = dateComponent.value;

      await click(unselectedDates[1]);

      const subsequentDateValue = dateComponent.value;

      expect(initialDateValue).not.to.equal(subsequentDateValue);
      expect(element._sentimentQueryController.variables.startDate).to.include(
        `T00:00:00Z`
      );
    });
  });

  describe('end date', () => {
    it('should default to null', async () => {
      const dateComponent = endDate(element);

      expect(!!dateComponent).to.equal(true);

      const actualDate = dateComponent.value;

      expect(!actualDate).to.equal(true);
    });

    it('should allow clearing the date', async () => {
      expect(endDate(element).getAttribute('clear-button-visible')).to.equal(
        ''
      );
    });

    it('should allow the user to select a new date', async () => {
      const dateComponent = endDate(element);

      await click(dateComponent);

      const unselectedDates = unselectedDateOptions(datePickerOverlay());

      const initialDateValue = dateComponent.value;

      await click(unselectedDates[1]);

      const subsequentDateValue = dateComponent.value;

      expect(!initialDateValue).to.equal(true);
      expect(!!subsequentDateValue).to.equal(true);
      expect(initialDateValue).not.to.equal(subsequentDateValue);
      expect(moment.utc(subsequentDateValue).isValid()).to.equal(true);
    });

    it('should update the subscription query variables', async () => {
      const dateComponent = endDate(element);

      await click(dateComponent);

      const unselectedDates = unselectedDateOptions(datePickerOverlay());

      const initialDateValue = dateComponent.value;

      await click(unselectedDates[1]);

      const subsequentDateValue = dateComponent.value;

      expect(initialDateValue).not.to.equal(subsequentDateValue);
      expect(
        element._sentimentSubscriptionController.variables.endDate
      ).to.equal(`${subsequentDateValue}T23:59:59Z`);
    });

    it('should update the sentiment query variables', async () => {
      const dateComponent = endDate(element);

      await click(dateComponent);

      const unselectedDates = unselectedDateOptions(datePickerOverlay());

      const initialDateValue = dateComponent.value;

      await click(unselectedDates[1]);

      const subsequentDateValue = dateComponent.value;

      expect(initialDateValue).not.to.equal(subsequentDateValue);
      expect(element._sentimentQueryController.variables.endDate).to.equal(
        `${subsequentDateValue}T23:59:59Z`
      );
    });

    it('should include entities up until the end of the day', async () => {
      const dateComponent = endDate(element);

      await click(dateComponent);

      const unselectedDates = unselectedDateOptions(datePickerOverlay());

      const initialDateValue = dateComponent.value;

      await click(unselectedDates[1]);

      const subsequentDateValue = dateComponent.value;

      expect(initialDateValue).not.to.equal(subsequentDateValue);
      expect(element._sentimentQueryController.variables.endDate).to.include(
        `T23:59:59Z`
      );
    });

    it('should query the api for new data', async () => {
      const dateComponent = endDate(element);

      await click(dateComponent);

      const unselectedDates = unselectedDateOptions(datePickerOverlay());

      sinon.spy(element._sentimentQueryController, 'executeQuery');

      await click(unselectedDates[1]);

      expect(
        element._sentimentQueryController.executeQuery.callCount
      ).to.be.greaterThan(0);
    });
  });
});
