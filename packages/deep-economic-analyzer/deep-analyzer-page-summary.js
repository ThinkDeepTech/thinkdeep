import {
  ApolloMutationController,
  ApolloQueryController,
  ApolloSubscriptionController,
} from '@apollo-elements/core';
import {LitElement, css, html} from '@apollo-elements/lit-apollo';
import '@google-web-components/google-chart';
import '@material/mwc-button';
import '@material/mwc-icon';
import '@material/mwc-list/mwc-list';
import '@material/mwc-list/mwc-list-item';
import '@material/mwc-select';
import '@material/mwc-textfield';
import './deep-site-configuration.js';
import CollectEconomicData from './graphql/CollectEconomicData.mutation.graphql';
import GetSentiment from './graphql/GetSentiment.query.graphql';
import UpdateSentiments from './graphql/UpdateSentiments.subscription.graphql';
import {translate} from 'lit-element-i18n';

/**
 * Lit summary page component.
 */
export default class DeepAnalyzerPageSummary extends LitElement {
  /**
   * Lit component property definitions.
   */
  static get properties() {
    return {
      subscriptionClient: {type: Object},

      sentiments: {type: Array},

      // Data collection mutation object
      collectEconomicData: {type: Object},

      // The users site configuration.
      configuration: {type: Object},

      selectedSentiments: {type: Array},

      // Fetch sentiment query object
      _getInitialSentimentQuery: {type: Object},
    };
  }

  /**
   * Lit component constructor.
   */
  constructor() {
    super();

    this.sentiments = [];

    this._getInitialSentimentQuery = new ApolloQueryController(
      this,
      GetSentiment,
      {
        variables: {
          economicEntityName: '',
          economicEntityType: 'BUSINESS',
        },
        noAutoSubscribe: true,
        onData: (data) => {
          this.sentiments = data?.sentiments || [];
        },
        onError: (error) => {
          this.sentiments = [];
          console.error(
            `Fetch sentiments failed with error: ${JSON.stringify(error)}`
          );
        },
      }
    );

    this.subscriptionClient = new ApolloSubscriptionController(
      this,
      UpdateSentiments,
      {
        variables: {
          economicEntityName: 'Google',
          economicEntityType: 'BUSINESS',
        },
        onData: ({subscriptionData}) => {
          this.sentiments = subscriptionData?.data?.updateSentiments || [];
        },
        onError: (error) => {
          this.sentiments = [];
          console.error(
            `An error occurred while subscribing to sentiment updates: ${JSON.stringify(
              error
            )}`
          );
        },
      }
    );

    this.collectEconomicData = new ApolloMutationController(
      this,
      CollectEconomicData,
      {
        onError: (error) => {
          console.error(
            `An error occurred while attempting to collect economic data: ${JSON.stringify(
              error
            )}`
          );
        },
      }
    );

    this.configuration = {observedEconomicEntities: []};

    this.selectedSentiments = [];
  }

  /**
   * Lit callback executed on first update of the component.
   */
  firstUpdated() {
    super.firstUpdated();
    this._setChartOptions();
  }

  /**
   * Lit component style definitions.
   * @return {TemplateResult}
   */
  static get styles() {
    return css`
      :host {
        display: grid;
        grid-template-columns: 1fr 1fr 1fr 1fr 1fr;
        grid-template-rows: 18vh 18vh 40vh;
        min-height: 80vh;
        background-color: var(--primary-color-dark);
      }

      google-chart {
        grid-column-start: 1;
        grid-row-start: 3;
        grid-row-end: 5;
      }

      mwc-list {
        grid-column-start: 3;
        grid-column-end: 6;
        grid-row-start: 1;
        grid-row-end: 4;
        overflow: scroll;
      }

      .tweet {
        height: 16vh;
        width: 90%;
        color: var(--primary-color);
      }

      mwc-button,
      mwc-textfield,
      mwc-select {
        --mdc-theme-primary: var(--primary-color);
        width: 100%;
      }

      .input {
        grid-column-start: 1;
        grid-column-end: 3;
        margin-top: 5vh;
        margin-bottom: 5vh;
        margin-left: 2vw;
        margin-right: 2vw;
      }

      @media (max-width: 768px) {
        :host {
          display: grid;
          grid-template-columns: 1fr;
          min-height: 80vh;
        }

        google-chart {
          grid-column-start: 1;
          grid-row-start: 3;
        }

        mwc-list {
          grid-column-start: 1;
          grid-column-end: 6;
          grid-row-start: 4;
        }

        mwc-button,
        mwc-textfield,
        mwc-select {
          width: 92vw;
        }
      }

      [hidden] {
        display: none;
      }
    `;
  }

  /**
   * Lit component render function.
   * @return {TemplateResult}
   */
  render() {
    return html`
      <deep-site-configuration
        @site-configuration="${this._handleSiteConfig}"
        hidden
      ></deep-site-configuration>

      <div class="input">
        <mwc-textfield
          label="Enter a Business Name"
          @input="${this._onInput.bind(this)}"
        ></mwc-textfield>
        <mwc-button
          raised
          label="${translate('translations:startButtonLabel')}"
          @click="${this._collectEconomicData.bind(this)}"
          icon="input"
        ></mwc-button>
      </div>

      <div class="input">
        <mwc-select label="Analyze a business" @selected="${this._onSelect}">
          ${this.configuration.observedEconomicEntities.map(
            (economicEntity, index) =>
              html`<mwc-list-item
                ?selected="${index === 0}"
                value="${economicEntity.name}"
                >${economicEntity.name}</mwc-list-item
              >`
          )}
        </mwc-select>
      </div>

      <google-chart
        @google-chart-select="${this._handleChartSelection}"
        type="line"
        options='{"title": "Sentiment as a function of time" }'
        cols='[{"label": "Timestamp", "type": "number"}, {"label": "Sentiment", "type": "number"}]'
        rows="[${this.sentiments?.map((sentiment) =>
          JSON.stringify([sentiment.timestamp, sentiment.score])
        )}]"
      ></google-chart>

      <mwc-list>
        ${this.selectedSentiments.map((sentiment) =>
          sentiment?.tweets?.map(
            (tweet, index) => html`
              <mwc-list-item class="tweet">
                <h3>Tweet ${index}</h3>
                <p>${tweet?.text}</p>
              </mwc-list-item>
              <li divider padded role="separator"></li>
            `
          )
        )}
      </mwc-list>
    `;
  }

  /**
   * Set the options for the sentiment chart.
   */
  _setChartOptions() {
    const googleChart = this.shadowRoot.querySelector('google-chart');
    const options = googleChart.options;
    options.vAxis = {title: 'Sentiment', minValue: -5, maxValue: 5};
    googleChart.options = options;
  }

  /**
   * Handle a user's click on point present in the google chart.
   */
  _handleChartSelection() {
    const googleChart = this.shadowRoot.querySelector('google-chart');

    this.selectedSentiments = [];

    for (const selection of googleChart.selection) {
      const selectedRow = selection.row || 0;

      const selectedPoint = googleChart.rows[selectedRow];

      this.sentiments?.forEach((sentiment) => {
        if (this._hasMatchingData(sentiment, selectedPoint)) {
          this.selectedSentiments.push(sentiment);
        }
      });
    }
  }

  /**
   * Determine if the sentiment matches the data at the selected point in the google chart.
   * @param {Object} sentiment - Sentiment response from the API.
   * @param {Array} selectedPoint - Point selected on the google chart.
   * @return {Boolean} True if data matches. False otherwise.
   */
  _hasMatchingData(sentiment, selectedPoint) {
    return (
      sentiment.timestamp === selectedPoint[0] &&
      sentiment.score === selectedPoint[1]
    );
  }

  /**
   * Handle input.
   */
  _onInput() {
    const companyName = this.shadowRoot.querySelector('mwc-textfield').value;
    this.collectEconomicData.variables = {
      economicEntityName: companyName,
      economicEntityType: 'BUSINESS',
    };
  }

  /**
   * Collect economic data and update the user configuration to account for new collections.
   */
  _collectEconomicData() {
    const deepSiteConfig = this.shadowRoot.querySelector(
      'deep-site-configuration'
    );
    deepSiteConfig.observeEconomicEntity({
      name: this.collectEconomicData.variables.economicEntityName || '',
      type: this.collectEconomicData.variables.economicEntityType || '',
    });
    deepSiteConfig.updateConfiguration();
    this.collectEconomicData.mutate();
  }

  /**
   * Find the selected business and add it to the query variables.
   */
  _onSelect() {
    const businessName = this.shadowRoot.querySelector(
      '[aria-selected="true"]'
    ).value;

    const variables = {
      economicEntityName: businessName,
      economicEntityType: 'BUSINESS',
    };

    // Subscribe to updates for the desired business.
    // NOTE: This must occur before the data is fetched for the first time. Otherwise,
    // updating from zero to one watched business won't update the sentiment graph.
    this.subscriptionClient.variables = variables;

    // Fetch the data right away
    this._getInitialSentimentQuery.variables = variables;
    this._getInitialSentimentQuery.executeQuery();
  }

  /**
   * Handle reception of the site-configuration event.
   * @param {Object} detail - Configuration of the form { observedEconomicEntities: [...]}.
   */
  _handleSiteConfig({detail}) {
    this.configuration = detail || {observedEconomicEntities: []};
  }
}

customElements.define('deep-analyzer-page-summary', DeepAnalyzerPageSummary);
