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
import '@vaadin/date-picker';
import './deep-site-configuration.js';
import CollectEconomicData from './graphql/CollectEconomicData.mutation.graphql';
import GetSentiment from './graphql/GetSentiment.query.graphql';
import UpdateSentiments from './graphql/UpdateSentiments.subscription.graphql';
import moment from 'moment/dist/moment.js';

const DEFAULT_START_DATE = moment()
  .utc()
  .subtract(1, 'month')
  .format('YYYY-MM-DD');
const DEFAULT_END_DATE = null;

/**
 * Lit summary page component.
 */
export default class DeepAnalyzerPageSummary extends LitElement {
  /**
   * Lit component property definitions.
   */
  static get properties() {
    return {
      sentimentDatas: {type: Array},

      _siteConfiguration: {type: Object},

      _sentimentQueryController: {type: Object},

      _sentimentSubscriptionController: {type: Object},

      _collectEconomicDataMutationController: {type: Object},
    };
  }

  /**
   * TODO
   * - Translations
   */

  /**
   * Lit component constructor.
   */
  constructor() {
    super();

    this.sentimentDatas = [];

    this._siteConfiguration = {observedEconomicEntities: []};

    this._sentimentQueryController = new ApolloQueryController(
      this,
      GetSentiment,
      {
        variables: {
          economicEntities: [],
          startDate: this._utcDateString(DEFAULT_START_DATE, {
            hour: 0,
            minute: 0,
            second: 0,
            millisecond: 0,
          }),
          endDate: DEFAULT_END_DATE
            ? this._utcDateString(DEFAULT_END_DATE, {
                hour: 23,
                minute: 59,
                second: 59,
                millisecond: 999,
              })
            : DEFAULT_END_DATE,
        },
        noAutoSubscribe: true,
        onData: (data) => {
          const targetDatas = data?.getSentiments[0] || [];
          if (targetDatas.length > 0) {
            this.sentimentDatas = targetDatas;
          }
        },
        onError: (error) => {
          console.error(
            `Fetch sentiments failed with error: ${JSON.stringify(error)}`
          );
        },
      }
    );

    this._sentimentSubscriptionController = new ApolloSubscriptionController(
      this,
      UpdateSentiments,
      {
        variables: {
          economicEntities: [],
          startDate: this._utcDateString(DEFAULT_START_DATE, {
            hour: 0,
            minute: 0,
            second: 0,
            millisecond: 0,
          }),
          endDate: DEFAULT_END_DATE
            ? this._utcDateString(DEFAULT_END_DATE, {
                hour: 23,
                minute: 59,
                second: 59,
                millisecond: 999,
              })
            : DEFAULT_END_DATE,
        },
        onData: ({subscriptionData}) => {
          const newSentiment = subscriptionData?.data?.updateSentiments;
          if (Object.keys(newSentiment).length > 0) {
            // Remove oldest reading from array.
            this.sentimentDatas.shift();

            // Push newest reading into array.
            this.sentimentDatas.push(newSentiment);
          }
        },
        onError: (error) => {
          console.error(
            `An error occurred while subscribing to sentiment updates: ${JSON.stringify(
              error
            )}`
          );
        },
      }
    );

    this._collectEconomicDataMutationController = new ApolloMutationController(
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
    const INPUT_RADIUS = 3;
    const INPUT_WIDTH = 90;
    return css`
      :host {
        display: block;
        height: 100%;
        width: 100%;
      }

      .page-grid {
        display: grid;
        grid-template-columns: 1fr;
        grid-template-rows: auto 62px auto;
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
        height: 75vh;
        width: ${INPUT_WIDTH}%;
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
        width: ${INPUT_WIDTH}%;
        height: 275px;
        max-height: 275px;
        padding: 8px;
        margin: 8px;
      }

      .input {
        width: ${INPUT_WIDTH}%;
        max-width: ${INPUT_WIDTH}%;
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
        grid-template-rows: auto auto auto;
        grid-gap: 2%;
        align-items: stretch;
      }

      .date-picker {
        background-color: white;
        border-radius: ${INPUT_RADIUS}px;
        width: 100%;
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
          grid-template-columns: 1fr 1fr 1fr;
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
   * Lit updated lifecycle callback.
   */
  updated() {
    const chart = this.shadowRoot.querySelector('google-chart');
    if (chart) {
      this._setChartOptions();
    }
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
        ${this._cardDeck(this.sentimentDatas)} ${this._watchInputs()}
        ${this._selectionInputs(this._siteConfiguration)}
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
   * Redraw the chart.
   *
   * NOTE: The use of an arrow function is required here because it ensures that
   * the 'this' context of the redraw function references the component when executed
   * from addEventListener.
   */
  _redrawChart = () => {
    const chart = this.shadowRoot.querySelector('google-chart');
    if (chart) {
      chart.redraw();
    }
  };

  /**
   * Determine if the sentiment matches the data at the selected point in the google chart.
   * @param {Object} sentiment - Sentiment response from the API.
   * @param {Array} selectedPoint - Point selected on the google chart.
   * @return {Boolean} True if data matches. False otherwise.
   */
  _hasMatchingData(sentiment, selectedPoint) {
    return (
      sentiment.utcDateTime === selectedPoint[0] &&
      sentiment.comparative === selectedPoint[1]
    );
  }

  /**
   * Handle input.
   */
  _onInput() {
    const companyName = this.shadowRoot.querySelector('mwc-textfield').value;
    this._collectEconomicDataMutationController.variables = {
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
      name:
        this._collectEconomicDataMutationController.variables
          .economicEntityName || '',
      type:
        this._collectEconomicDataMutationController.variables
          .economicEntityType || '',
    });
    deepSiteConfig.updateConfiguration();
    this._collectEconomicDataMutationController.mutate();
  }

  /**
   * Find the selected business and add it to the query variables.
   */
  _onSelectBusiness() {
    const businessName = this.shadowRoot.querySelector(
      '#business > [aria-selected="true"]'
    ).value;

    const variables = {
      ...this._sentimentQueryController.variables,
      economicEntities: [
        {
          name: businessName,
          type: 'BUSINESS',
        },
      ],
    };

    this._updateSentimentControllers(variables);
    this._sentimentQueryController.executeQuery();
  }

  /**
   * Handle user selection of new start date.
   */
  _onSelectStartDate() {
    const selectedStartDate =
      this.shadowRoot.querySelector('#start-date').value;

    let utcDate = selectedStartDate;
    if (!utcDate) {
      console.warn(
        `An invalid start date was received. Falling back on the defaults.`
      );
      utcDate = DEFAULT_START_DATE;
    }

    utcDate = this._utcDateString(utcDate, {
      hour: 0,
      minute: 0,
      second: 0,
      millisecond: 0,
    });

    const variables = {
      ...this._sentimentQueryController.variables,
      startDate: utcDate,
    };

    this._updateSentimentControllers(variables);
    this._sentimentQueryController.executeQuery();
  }

  /**
   * Handle user selection of new end date.
   */
  _onSelectEndDate() {
    const selectedEndDate =
      this.shadowRoot.querySelector('#end-date').value || null;

    const utcDate = selectedEndDate
      ? this._utcDateString(selectedEndDate, {
          hour: 23,
          minute: 59,
          second: 59,
          millisecond: 999,
        })
      : null;

    const variables = {
      ...this._sentimentQueryController.variables,
      endDate: utcDate,
    };

    this._updateSentimentControllers(variables);
    this._sentimentQueryController.executeQuery();
  }

  /**
   * Convert date to utc string.
   * @param {String} subject Date string.
   * @param {Object} options Date transform options. I.e, { hour: <hour to set>, minute: <minute to set>, etc }.
   * @return {String} UTC formatted date time.
   */
  _utcDateString(subject, options) {
    const utcDate = moment.utc(subject);
    if (Object.keys(options).length > 0) {
      utcDate.set(options);
    }
    return utcDate.format();
  }

  _subscriptionClient;
  /**
   * Update sentiment controllers to use new values.
   * @param {Object} variables
   */
  _updateSentimentControllers(variables) {
    // Subscribe to updates for the desired business.
    // NOTE: This must occur before the data is fetched for the first time. Otherwise,
    // updating from zero to one watched business won't update the sentiment graph.
    this._sentimentSubscriptionController.variables = variables;

    // Fetch the data right away
    this._sentimentQueryController.variables = variables;
  }

  /**
   * Get the most recent sentiment value.
   * @param {Object} sentimentDatas Data which will be used to fetch most recent sentiment.
   * @return {Number} Most recent sentiment value.
   */
  _mostRecentSentiment(sentimentDatas) {
    return sentimentDatas[sentimentDatas.length - 1]?.comparative || 0;
  }

  /**
   * Get markup for sentiment summary card.
   * @param {Array<Object>} sentimentDatas
   * @return {Object} Lit HTML template result or ''.
   */
  _sentimentSummaryCard(sentimentDatas) {
    return sentimentDatas.length > 0
      ? html`
          <deep-card class="card">
            <h4 slot="header">Sentiment Summary</h4>
            <div class="summary" slot="body">
              <div>
                Recent
                <div>
                  ${this._mostRecentSentiment(this.sentimentDatas).toFixed(3)}
                </div>
              </div>
              <div>
                Average
                <div>
                  ${(
                    this.sentimentDatas
                      .map((value) => value.comparative || 0)
                      .reduce((previous, current) => previous + current, 0) /
                    this.sentimentDatas.length
                  ).toFixed(3)}
                </div>
              </div>
            </div>
          </deep-card>
        `
      : ``;
  }

  /**
   * Get markup for sentiment graph.
   * @param {Array<Object>} sentimentDatas
   * @return {Object} Lit HTML template result or ''.
   */
  _sentimentGraphCard(sentimentDatas) {
    // @google-chart-select="${this._handleChartSelection}"
    return sentimentDatas.length > 0
      ? html`
          <deep-card class="card">
            <h4 slot="header">Public Sentiment</h4>
            <google-chart
              slot="body"
              options="{}"
              type="line"
              cols='[{"label": "Date", "type": "string"}, {"label": "Comparative Score", "type": "number"}]'
              rows="[${sentimentDatas?.map((sentiment) =>
                JSON.stringify([
                  moment.utc(sentiment.utcDateTime).local().toDate(),
                  sentiment.comparative,
                ])
              )}]"
            ></google-chart>
          </deep-card>
        `
      : ``;
  }

  /**
   * Get watch input markup.
   * @return {Object} Lit template result.
   */
  _watchInputs() {
    return html` <div class="input watch">
      <mwc-textfield
        label="Watch (i.e, Google)"
        @input="${this._onInput.bind(this)}"
      ></mwc-textfield>
      <mwc-button
        raised
        @click="${this._collectEconomicData.bind(this)}"
        icon="add"
      ></mwc-button>
    </div>`;
  }

  /**
   * Get selection input markup.
   * @param {Object} siteConfiguration User configuration.
   * @return {Object} Lit template result.
   */
  _selectionInputs(siteConfiguration) {
    return html`
      <div class="input selection">
        <mwc-select
          id="business"
          label="Analyze"
          @selected="${this._onSelectBusiness}"
        >
          ${siteConfiguration.observedEconomicEntities.map(
            (economicEntity, index) =>
              html`<mwc-list-item
                ?selected="${index === 0}"
                value="${economicEntity.name}"
                >${economicEntity.name}</mwc-list-item
              >`
          )}
        </mwc-select>
        <vaadin-date-picker
          id="start-date"
          label="Start Date"
          class="date-picker"
          placeholder="MM/DD/YYYY"
          value="${DEFAULT_START_DATE}"
          @value-changed="${this._onSelectStartDate.bind(this)}"
          required
        ></vaadin-date-picker>
        <vaadin-date-picker
          id="end-date"
          label="End Date"
          class="date-picker"
          placeholder="MM/DD/YYYY"
          clear-button-visible
          @value-changed="${this._onSelectEndDate.bind(this)}"
        ></vaadin-date-picker>
      </div>
    `;
  }

  /**
   * Get card deck markup.
   * @param {Array<Object>} sentimentDatas Sentiment data from the api.
   * @return {Object} Lit template result.
   */
  _cardDeck(sentimentDatas) {
    return html`
      <div class="card-deck">
        ${sentimentDatas.length > 0
          ? this._sentimentSummaryCard(sentimentDatas)
          : ``}
        ${sentimentDatas.length > 0
          ? this._sentimentGraphCard(sentimentDatas)
          : ``}
      </div>
    `;
  }

  /**
   * Handle reception of the site-configuration event.
   * @param {Object} detail - Configuration of the form { observedEconomicEntities: [...]}.
   */
  _handleSiteConfig({detail}) {
    this._siteConfiguration = detail || {observedEconomicEntities: []};
  }
}

customElements.define('deep-analyzer-page-summary', DeepAnalyzerPageSummary);
