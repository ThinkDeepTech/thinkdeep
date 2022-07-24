import {html, expect} from '@open-wc/testing';
import {fixtureSync, select} from '@thinkdeep/tools/test-helper.js';
import {initializeE2e} from './initialize-e2e.js';
import sinon from 'sinon';

import {unselectedAnalysisDropdownOptions} from './deep-analyzer-page-summary-helpers.js';
import DeepAnalyzerPageSummary from '../deep-analyzer-page-summary.js';
import {EconomicEntityFactory, EconomicEntityType} from '@thinkdeep/model';

describe('deep-analyzer-page-summary', () => {
  beforeEach(async () => {
    await initializeE2e(
      process.env.PREDECOS_TEST_AUTH_PREMIUM_USERNAME,
      process.env.PREDECOS_TEST_AUTH_PREMIUM_PASSWORD
    );
  });

  describe('_hasMatchingData', () => {
    let element;
    beforeEach(() => {
      element = new DeepAnalyzerPageSummary();
    });

    it('should return true when the selected point matches the sentiment', async () => {
      const sentiment = {utcDateTime: '2022-12-20T00:00:00Z', comparative: 1};
      const point = [sentiment.utcDateTime, sentiment.comparative];
      expect(element._hasMatchingData(sentiment, point)).to.equal(true);
    });

    it('should return false when the selected point has a different comparative', async () => {
      const sentiment = {utcDateTime: '2022-12-20T00:00:00Z', comparative: 1};
      const point = [sentiment.utcDateTime, sentiment.comparative + 1];
      expect(element._hasMatchingData(sentiment, point)).to.equal(false);
    });

    it('should return false when the selected point has a different date', async () => {
      const sentiment = {utcDateTime: '2022-12-20T00:00:00Z', comparative: 1};
      const point = ['2022-06-21T00:00:00Z', sentiment.comparative];
      expect(element._hasMatchingData(sentiment, point)).to.equal(false);
    });
  });

  describe('_onInput', () => {
    let element;
    beforeEach(async () => {
      element = await fixtureSync(
        html`<deep-analyzer-page-summary></deep-analyzer-page-summary>`
      );
    });

    it('should pass the value in the watch text input into the mutation controller', () => {
      const companyName = 'Google';
      const input = element.shadowRoot.querySelector('mwc-textfield');
      const expectedEconomicEntity = EconomicEntityFactory.economicEntity({
        name: companyName,
        type: EconomicEntityType.Business,
      });
      input.value = companyName;

      element._onInput();

      const actualEconomicEntity =
        element._collectEconomicDataMutationController.variables
          .economicEntities[0];
      expect(expectedEconomicEntity.equals(actualEconomicEntity)).to.equal(
        true
      );
    });
  });

  describe('_collectEconomicData', () => {
    let element;
    beforeEach(async () => {
      element = await fixtureSync(
        html`<deep-analyzer-page-summary></deep-analyzer-page-summary>`
      );
    });

    it('should update the site configuration to include the necessary economic entity', () => {
      const economicEntity = EconomicEntityFactory.economicEntity({
        name: 'Google',
        type: EconomicEntityType.Business,
      });
      const configurationComponent = element.shadowRoot.querySelector(
        'deep-site-configuration'
      );
      sinon.spy(configurationComponent, 'observeEconomicEntity');
      sinon.spy(configurationComponent, 'updateConfiguration');
      element._collectEconomicDataMutationController.variables = {};
      element._collectEconomicDataMutationController.variables.economicEntities =
        [economicEntity];

      element._collectEconomicData();

      expect(
        configurationComponent.observeEconomicEntity
      ).to.have.been.calledWith(economicEntity);
      expect(configurationComponent.updateConfiguration.callCount).to.equal(1);
    });

    it('should trigger collection of economic data', () => {
      const economicEntity = EconomicEntityFactory.economicEntity({
        name: 'Google',
        type: EconomicEntityType.Business,
      });
      element._collectEconomicDataMutationController.variables = {};
      element._collectEconomicDataMutationController.variables.economicEntities =
        [economicEntity];
      sinon.spy(element._collectEconomicDataMutationController, 'mutate');

      element._collectEconomicData();

      expect(
        element._collectEconomicDataMutationController.mutate.callCount
      ).to.equal(1);
    });
  });

  describe('_onSelectBusiness', () => {
    let element;
    beforeEach(async () => {
      element = await fixtureSync(
        html`<deep-analyzer-page-summary></deep-analyzer-page-summary>`
      );
    });

    it('should update the subscription to the selected business', async () => {
      const unselectedDropdownOption =
        unselectedAnalysisDropdownOptions(element)[0];

      expect(!!unselectedDropdownOption).to.equal(true);

      await select(unselectedDropdownOption);

      element._onSelectBusiness();

      const expectedEconomicEntity = EconomicEntityFactory.economicEntity({
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

      element._onSelectBusiness();

      const expectedEconomicEntity = EconomicEntityFactory.economicEntity({
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

      element._onSelectBusiness();

      expect(element._sentimentQueryController.executeQuery.callCount).to.equal(
        1
      );
    });
  });
});
