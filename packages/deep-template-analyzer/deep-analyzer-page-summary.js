import {ApolloQuery, html} from '@apollo-elements/lit-apollo';
import '@google-web-components/google-chart';
import '@thinkdeep/deep-card/deep-card.mjs';
import GetSentiment from './graphql/GetSentiment.query.graphql';

export default class DeepAnalyzerPageSummary extends ApolloQuery {
  static get properties() {
    return {
      selectedSentiment: {type: Object},
    };
  }

  constructor() {
    super();

    this.query = GetSentiment;

    this.variables = {
      economicEntityName: 'Google',
      economicEntityType: 'BUSINESS',
    };

    this.selectedSentiment = {};
  }

  render() {
    return html`
      <!-- TODO: Translations -->
      Start Collecting:
      <deep-textbox placeholder="Business Name (i.e, Google)"></deep-textbox>

      Select Business:
      <select name="business" id="business">
        <option value="Google">Google</option>
      </select>

      <google-chart
        type="line"
        options='{"title": "Sentiment as a function of time" }'
        data='[["Year", "Sentiment"],${this.data?.getSentiment?.sentiments.map(
          (sentiment) => {
            return JSON.stringify([sentiment.timestamp, sentiment.score]);
          }
        )}]'
      >
      </google-chart>

      <!-- TODO: Modify such that not just first but dynamic -->
      ${this.data?.getSentiment?.sentiments[0]?.tweets?.map(
        (tweet, index) => html`
          <deep-card>
            <h3>Tweet ${index}</h3>
            <p>${tweet?.text}</p>
          </deep-card>
        `
      )}

      <!-- ${this.data?.search?.map(
        (business) => html`<p>${business.id} : ${business.name}</p>`
      )} -->
    `;
  }
}

customElements.define('deep-analyzer-page-summary', DeepAnalyzerPageSummary);
