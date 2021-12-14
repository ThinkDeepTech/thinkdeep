import {ApolloMutationController} from '@apollo-elements/core';
import {ApolloQuery, html} from '@apollo-elements/lit-apollo';
import '@google-web-components/google-chart';
import '@thinkdeep/deep-button/deep-button.mjs';
import '@thinkdeep/deep-card/deep-card.mjs';
import '@thinkdeep/deep-textbox/deep-textbox.mjs';
import {debounce} from './debounce.mjs';
import {translate} from 'lit-element-i18n';
import CollectEconomicData from './graphql/CollectEconomicData.mutation.graphql';
import GetSentiment from './graphql/GetSentiment.query.graphql';

export default class DeepAnalyzerPageSummary extends ApolloQuery {
  static get properties() {
    return {
      mutation: {type: Object},
      selectedSentiments: {type: Array},
    };
  }

  constructor() {
    super();

    this.query = GetSentiment;

    this.variables = {
      economicEntityName: 'Google',
      economicEntityType: 'BUSINESS',
    };

    this.mutation = new ApolloMutationController(this, CollectEconomicData);

    this.selectedSentiments = [];
  }

  connectedCallback() {
    super.connectedCallback();

    this.addEventListener('google-chart-select', this._handleChartSelection);
  }

  disconnectedCallback() {
    super.disconnectedCallback();

    this.removeEventListener('google-chart-select', this._handleChartSelection);
  }

  render() {
    return html`
      ${translate('translations:startCollectingLabel')}
      <deep-textbox
        placeholder="i.e, Google"
        @input="${debounce(this._setCompanyName.bind(this), 350)}"
      ></deep-textbox>
      <deep-button @click="${() => this.mutation.mutate()}"
        >${translate('translations:startButtonLabel')}</deep-button
      >

      <google-chart
        type="line"
        options='{"title": "Sentiment as a function of time" }'
        cols='[{"label": "Timestamp", "type": "number"}, {"label": "Sentiment", "type": "number"}]'
        rows="[${this.data?.sentiments?.map((sentiment) =>
          JSON.stringify([sentiment.timestamp, sentiment.score])
        )}]"
      >
      </google-chart>

      ${this.selectedSentiments.map((sentiment) =>
        sentiment?.tweets?.map(
          (tweet, index) => html`
            <deep-card>
              <h3>Tweet ${index}</h3>
              <p>${tweet?.text}</p>
            </deep-card>
          `
        )
      )}
    `;
  }

  /**
   * Handle a user's click on point present in the google chart.
   * @param {HTMLElement} originalTarget - Target of the click (i.e, google-chart).
   */
  _handleChartSelection({originalTarget}) {
    const googleChart = originalTarget;

    this.selectedSentiments = [];

    for (const selection of googleChart.selection) {
      const selectedRow = selection.row || 0;

      const selectedPoint = googleChart.rows[selectedRow];

      this.data?.sentiments?.forEach((sentiment) => {
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

  _setCompanyName({explicitOriginalTarget}) {
    const companyName = explicitOriginalTarget.value;
    this.mutation.variables = {
      economicEntityName: companyName,
      economicEntityType: 'BUSINESS',
    };
  }
}

customElements.define('deep-analyzer-page-summary', DeepAnalyzerPageSummary);
