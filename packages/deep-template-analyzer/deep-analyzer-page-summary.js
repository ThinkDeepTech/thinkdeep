import {ApolloQuery, html} from '@apollo-elements/lit-apollo';
import '@google-web-components/google-chart';
import '@thinkdeep/deep-button/deep-button.mjs';
import '@thinkdeep/deep-card/deep-card.mjs';
import '@thinkdeep/deep-textbox/deep-textbox.mjs';
import GetSentiment from './graphql/GetSentiment.query.graphql';

export default class DeepAnalyzerPageSummary extends ApolloQuery {
  static get properties() {
    return {
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
      <!-- TODO: Translations -->
      Start Collecting:
      <deep-textbox placeholder="Business Name (i.e, Google)"></deep-textbox>
      <deep-button @click="${this._collectData}">Collect Data</deep-button>

      Select Business:
      <select name="business" id="business">
        <option value="Google">Google</option>
      </select>

      <google-chart
        type="line"
        options='{"title": "Sentiment as a function of time" }'
        cols='[{"label": "Year", "type": "number"}, {"label": "Sentiment", "type": "number"}]'
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

  _handleChartSelection({originalTarget}) {
    const googleChart = originalTarget;

    this.selectedSentiments = [];

    for (const selection of googleChart.selection) {
      const selectedRow = selection.row || 0;

      const selectedPoint = googleChart.rows[selectedRow];

      this.data?.sentiments?.forEach((sentiment) => {
        if (this._isMatchingSentiment(sentiment, selectedPoint)) {
          this.selectedSentiments.push(sentiment);
        }
      });
    }
  }

  _isMatchingSentiment(sentiment, selectedPoint) {
    return (
      sentiment.timestamp === selectedPoint[0] &&
      sentiment.score === selectedPoint[1]
    );
  }
}

customElements.define('deep-analyzer-page-summary', DeepAnalyzerPageSummary);
