import {
  ApolloMutationController,
  // ApolloQueryController,
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
import {debounce} from './debounce.mjs';
import './deep-site-configuration.mjs';
import CollectEconomicData from './graphql/CollectEconomicData.mutation.graphql';
// import GetSentiment from './graphql/GetSentiment.query.graphql';
import UpdateSentiments from './graphql/UpdateSentiments.subscription.graphql';
import {translate} from 'lit-element-i18n';

// const UPDATE_SENTIMENT_INTERVAL = 5 * 60 * 1000; /** min * seconds * ms */

export default class DeepAnalyzerPageSummary extends LitElement {
  static get properties() {
    return {
      subscriptionClient: {type: Object},

      // Fetch sentiment query object
      getSentiment: {type: Object},

      getSentimentIntervalId: {type: Number},

      // Data collection mutation object
      collectEconomicData: {type: Object},

      // The users site configuration.
      configuration: {type: Object},

      selectedSentiments: {type: Array},
    };
  }

  constructor() {
    super();

    // this.getSentiment = new ApolloQueryController(this, GetSentiment, {
    //   variables: {
    //     economicEntityName: '',
    //     economicEntityType: 'BUSINESS',
    //   },
    //   noAutoSubscribe: true,
    //   onData: this._triggerUpdate.bind(this),
    // });

    this.getSentiment = {data: {}};

    this.getSentiment = new ApolloSubscriptionController(
      this,
      UpdateSentiments,
      {
        variables: {
          economicEntityName: 'Google',
          economicEntityType: 'BUSINESS',
        },
        onData: ({subscriptionData}) => {
          this.getSentiment.data.sentiments =
            subscriptionData.data.updateSentiments;
        },
      }
    );

    this.collectEconomicData = new ApolloMutationController(
      this,
      CollectEconomicData
    );

    this.configuration = {observedEconomicEntities: []};

    this.selectedSentiments = [];
  }

  firstUpdated() {
    super.firstUpdated();

    this._setChartOptions();
  }

  static get styles() {
    return css`
      :host {
        display: grid;
        grid-template-columns: 1fr 1fr 1fr 1fr 1fr;
        grid-template-rows: 18vh 18vh 40vh;
        min-height: 80vh;
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

  render() {
    return html`
      <deep-site-configuration
        @site-configuration="${this._handleSiteConfig}"
        hidden
      ></deep-site-configuration>

      <div class="input">
        <mwc-textfield
          label="Enter a Business Name"
          @input="${debounce(this._onInput.bind(this), 350)}"
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
        rows="[${this.getSentiment?.data?.sentiments?.map((sentiment) =>
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

      this.getSentiment?.data?.sentiments?.forEach((sentiment) => {
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
   * @returns
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
    this.getSentiment.variables = {
      economicEntityName: businessName,
      economicEntityType: 'BUSINESS',
    };
    // this.getSentiment.executeQuery();
  }

  /**
   * Handle reception of the site-configuration event.
   * @param {Object} detail - Configuration of the form { observedEconomicEntities: [...]}.
   */
  _handleSiteConfig({detail}) {
    this.configuration = detail || {observedEconomicEntities: []};
  }

  /**
   * Trigger an update to the DOM.
   *
   * NOTE: This is used because the google-chart wasn't dynamically updating as a result of data fetch.
   * This happened to solve the issue.
   */
  _triggerUpdate() {
    this.requestUpdate();
  }
}

customElements.define('deep-analyzer-page-summary', DeepAnalyzerPageSummary);
