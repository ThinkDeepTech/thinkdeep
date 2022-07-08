import {
  ApolloMutationController,
  ApolloQueryController,
  ApolloSubscriptionController,
} from '@apollo-elements/core';
import {LitElement, css, html} from '@apollo-elements/lit-apollo';
import '@google-web-components/google-chart';
import '@material/mwc-button';
import '@material/mwc-icon';
import '@material/mwc-list/mwc-list-item';
import '@material/mwc-select';
import '@material/mwc-textfield';
import '@thinkdeep/deep-card';
import './deep-site-configuration.js';
import CollectEconomicData from './graphql/CollectEconomicData.mutation.graphql';
import GetSentiment from './graphql/GetSentiment.query.graphql';
import UpdateSentiments from './graphql/UpdateSentiments.subscription.graphql';
import moment from 'moment';

const DEFAULT_DATA = {
  year: [
    {
      numChildren: 0,
      firstChild: 0,
      sentiment: 0,
    },
  ],
  month: [
    {
      numChildren: 0,
      firstChild: 0,
      sentiment: 0,
    },
  ],
  day: [
    {
      numChildren: 0,
      firstChild: 0,
      sentiment: 0,
    },
  ],
  hour: [
    {
      numChildren: 0,
      firstChild: 0,
      sentiment: 0,
    },
  ],
  minute: [
    {
      numChildren: 0,
      firstChild: 0,
      sentiment: 0,
    },
  ],
  tweets: [
    {
      value: '',
    },
  ],
};

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
   * TODO
   * 1. Modify sentiment fetch to use new data interface (i.e, { data: {year:..., month:..., etc}}).
   * 2. Modify subscription to use new data interface.
   * 3. If network fails, do not zero sentiment.
   * 4. Evaluate user experience in various cases and create TODOs to handle a good user interface
   * when a shotty network is used.
   */

  /**
   * Lit component constructor.
   */
  constructor() {
    super();

    this.data = DEFAULT_DATA;
    this.selectedEconomicEntity = {name: '', type: 'business'};
    this.selectedSentiments = [];
    this.configuration = {observedEconomicEntities: []};
    // this.sentiments = [];

    const defaultStartDate = moment().subtract('month', 1).unix(); // TODO: Verify
    const defaultEndDate = moment().unix();

    this._getInitialSentimentQuery = new ApolloQueryController(
      this,
      GetSentiment,
      {
        variables: {
          economicEntities: [
            {
              name: '',
              type: 'BUSINESS',
            },
          ],
          startDate: defaultStartDate,
          endDate: defaultEndDate,
        },
        noAutoSubscribe: true,
        onData: (data) => {
          // TODO : Implement fetch from cache before default data.
          this.data = data?.getSentiments || this._cachedData() || DEFAULT_DATA;

          // TODO
          this._cacheData(this.data);
        },
        onError: (error) => {
          this.data = this._cachedData();
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
          economicEntities: [
            {
              name: '', // TODO: Use defaultBusiness.
              type: 'BUSINESS',
            },
          ],
          startDate: defaultStartDate,
          endDate: defaultEndDate,
        },
        onData: ({subscriptionData}) => {
          this.data =
            subscriptionData?.data?.updateSentiments ||
            this._cachedData() ||
            DEFAULT_DATA;

          this._cacheData(this.data);
        },
        onError: (error) => {
          this.data = this._cachedData();
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
  }

  /**
   * Lit callback executed on first update of the component.
   */
  async firstUpdated() {
    super.firstUpdated();
    this._setChartOptions();

    // NOTE: TODO: While a fix goes into place allowing mwc-button height/width to be set this
    // hack will be used to make the button size equal to what's desired for the app.
    await this.updateComplete;
    const materialButton = this.shadowRoot.querySelector('mwc-button');
    const button = materialButton.shadowRoot.querySelector('#button');
    button.setAttribute('style', 'height: 100%; width: 100%;');
  }

  /**
   * Lit callback on component connect.
   */
  connectedCallback() {
    super.connectedCallback();

    globalThis.addEventListener('resize', this._redrawChart);
    globalThis.addEventListener('orientationchange', this._redrawChart);
  }

  /**
   * Lit callback on component disconnect.
   */
  disconnectedCallback() {
    globalThis.removeEventListener('resize', this._redrawChart);
    globalThis.removeEventListener('orientationchange', this._redrawChart);

    super.disconnectedCallback();
  }

  /**
   * Lit component style definitions.
   * @return {TemplateResult}
   */
  static get styles() {
    return css`
      :host {
        display: block;
        height: 100%;
        width: 100%;
      }

      .page-grid {
        display: grid;
        grid-template-columns: 1fr;
        grid-template-rows: auto 62px 62px;
        justify-items: center;
        align-items: center;
        height: 100%;
        width: 100%;
      }

      .card-deck {
        display: grid;
        grid-template-columns: 1fr;
        grid-gap: 4px;
        justify-items: center;
        height: 100%;
        width: 90%;
        padding: 8px;
        margin: 8px;
        overflow: scroll;
        scrollbar-width: none;
        -ms-overflow-style: none;
      }

      .card-deck::-webkit-scrollbar {
        display: none; /* Safari and Chrome */
      }

      .card {
        width: 90%;
        height: 275px;
        max-height: 275px;
        padding: 8px;
        margin: 8px;
      }

      .input {
        width: 90%;
        max-width: 90%;
        margin: 2px;
      }

      .watch {
        display: grid;
        grid-template-columns: 80% 19.65%;
        grid-gap: 0.35%;
        justify-content: center;
        align-items: center;
      }

      .selection {
        display: grid;
        grid-template-columns: auto;
        grid-template-rows: auto auto;
        justify-content: center;
        align-items: center;
      }

      google-chart {
        width: 90%;
        height: auto;
        margin: 0px;
        padding: 0px;
      }

      .card {
        --shadow-color: var(--secondary-color-dark, lightgray);
      }

      mwc-button {
        height: 100%;
        width: 100%;
        --mdc-theme-primary: var(--primary-color-light);
        --mdc-theme-on-primary: var(--secondary-color);
      }

      .summary {
        display: flex;
        flex-direction: row;
        justify-content: space-around;
      }

      @media (min-width: 992px) {
        .card-deck {
          grid-template-columns: repeat(5, 1fr);
          grid-template-rows: auto;
        }

        .card {
          height: 85%;
          padding: 5%;
        }

        google-chart {
          width: 90%;
          height: 80%;
          margin: 0;
        }

        .selection {
          grid-template-columns: auto auto;
          grid-template-rows: auto;
          justify-content: space-between;
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

      <div class="page-grid">
        <div class="card-deck">
          <deep-card class="card">
            <h4 slot="header">Public Sentiment</h4>
            <div class="summary" slot="body">
              <div>
                Recent
                <!-- TODO Verify -->
                <!-- <div>${this.sentiments[0]?.score}</div> -->
                <div>${this._mostRecentSentiment(this.data)}</div>
              </div>
              <div>
                Average
                <div>
                  ${this.sentiments
                    .map((value) => value.score || 0)
                    .reduce((previous, current) => previous + current, 0) /
                  this.sentiments.length}
                </div>
              </div>
            </div>
          </deep-card>

          <deep-card class="card">
            <h4 slot="header">Public Sentiment</h4>
            <google-chart
              slot="body"
              @google-chart-select="${this._handleChartSelection}"
              options="{}"
              type="line"
              cols='[{"label": "Timestamp", "type": "number"}, {"label": "Sentiment", "type": "number"}]'
              rows="[${this.sentiments?.map((sentiment) =>
                JSON.stringify([sentiment.timestamp, sentiment.score])
              )}]"
            ></google-chart>
          </deep-card>
        </div>

        <div class="input watch">
          <mwc-textfield
            label="Watch (i.e, Google)"
            @input="${this._onInput.bind(this)}"
          ></mwc-textfield>
          <mwc-button
            raised
            @click="${this._collectEconomicData.bind(this)}"
            icon="add"
          ></mwc-button>
        </div>

        <div class="input selection">
          <mwc-select
            id="business"
            label="Analyze"
            @selected="${this._onSelectBusiness}"
          >
            ${this.configuration.observedEconomicEntities.map(
              (economicEntity, index) =>
                html`<mwc-list-item
                  ?selected="${index === 0}"
                  value="${economicEntity.name}"
                  >${economicEntity.name}</mwc-list-item
                >`
            )}
          </mwc-select>
          <!-- TODO: Incorporate start and end date pickers. -->
        </div>
      </div>
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
   * Redraw the chart.
   *
   * NOTE: The use of an arrow function is required here because it ensures that
   * the 'this' context of the redraw function references the component when executed
   * from addEventListener.
   */
  _redrawChart = () => {
    this.shadowRoot.querySelector('google-chart').redraw();
  };

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
  _onSelectBusiness() {
    const businessName = this.shadowRoot.querySelector(
      '#business > [aria-selected="true"]'
    ).value;

    const variables = {
      ...this._getInitialSentimentQuery.variables,
      economicEntities: [
        {
          name: businessName,
          type: 'BUSINESS',
        },
      ],
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
   * Handle user selection of new start date.
   */
  _onSelectStartDate() {
    const selectedStartDate = this.shadowRoot.querySelector(
      '#start-date > [aria-selected="true"]'
    ).value;

    const variables = {
      ...this._getInitialSentimentQuery.variables,
      startDate: selectedStartDate, // TODO: Incorporate date picker and verify/modify selection to work with that component.
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
   * Handle user selection of new end date.
   */
  _onSelectEndDate() {
    const selectedEndDate = this.shadowRoot.querySelector(
      '#end-date > [aria-selected="true"]'
    ).value;

    const variables = {
      ...this._getInitialSentimentQuery.variables,
      endDate: selectedEndDate, // TODO: Incorporate date picker and verify/modify selection to work with that component.
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
   * Get the most recent sentiment value.
   * @param {Object} data Data which will be used to fetch most recent sentiment.
   */
  _mostRecentSentiment(data) {}

  /**
   * Fetch data from cache.
   * @return {Object} Cached data.
   */
  _cachedData() {
    // TODO
    return DEFAULT_DATA;
  }

  /**
   * Add data to cache.
   * @param {Object} data Data to cache.
   */
  _cacheData(data) {
    // TODO
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
