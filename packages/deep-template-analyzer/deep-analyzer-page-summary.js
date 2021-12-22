import {
  ApolloMutationController,
  ApolloQueryController,
} from '@apollo-elements/core';
import {LitElement, css, html} from '@apollo-elements/lit-apollo';
import '@google-web-components/google-chart';
import '@material/mwc-button';
import '@material/mwc-list/mwc-list-item';
import '@material/mwc-select';
import '@material/mwc-textfield';
import '@thinkdeep/deep-button/deep-button.mjs';
import '@thinkdeep/deep-card/deep-card.mjs';
import '@thinkdeep/deep-textbox/deep-textbox.mjs';
import {debounce} from './debounce.mjs';
import {translate} from 'lit-element-i18n';
import CollectEconomicData from './graphql/CollectEconomicData.mutation.graphql';
import GetSentiment from './graphql/GetSentiment.query.graphql';

export default class DeepAnalyzerPageSummary extends LitElement {
  static get properties() {
    return {
      query: {type: Object},
      mutation: {type: Object},
      selectedSentiments: {type: Array},
    };
  }

  constructor() {
    super();

    this.query = new ApolloQueryController(this, GetSentiment, {
      variables: {
        economicEntityName: 'Google',
        economicEntityType: 'BUSINESS',
      },
      onData: this._triggerUpdate.bind(this),
    });

    this.mutation = new ApolloMutationController(this, CollectEconomicData);

    this.selectedSentiments = [];
  }

  connectedCallback() {
    super.connectedCallback();

    this.addEventListener('google-chart-select', this._handleChartSelection);
    this.addEventListener('selected', this._onSelect);
  }

  disconnectedCallback() {
    super.disconnectedCallback();

    this.removeEventListener('google-chart-select', this._handleChartSelection);
    this.removeEventListener('selected', this._onSelect);
  }

  static get styles() {
    return css`
      :host {
        display: block;
        min-height: 500px;
      }
    `;
  }

  render() {
    return html`
      ${translate('translations:startCollectingLabel')}
      <mwc-textfield
        label="Business name"
        @input="${debounce(this._onInput.bind(this), 350)}"
      ></mwc-textfield>
      <mwc-button
        raised
        label="${translate('translations:startButtonLabel')}"
        @click="${() => this.mutation.mutate()}"
        icon="input"
      ></mwc-button>

      <mwc-select label="Select a business">
        <mwc-list-item value="Google">Google</mwc-list-item>
        <mwc-list-item value="Amazon">Amazon</mwc-list-item>
        <mwc-list-item value="PetCo">PetCo</mwc-list-item>
        <mwc-list-item value="Tesla">Tesla</mwc-list-item>
        <mwc-list-item value="Ford">Ford</mwc-list-item>
      </mwc-select>

      <google-chart
        type="line"
        options='{"title": "Sentiment as a function of time" }'
        cols='[{"label": "Timestamp", "type": "number"}, {"label": "Sentiment", "type": "number"}]'
        rows="[${this.query?.data?.sentiments?.map((sentiment) =>
          JSON.stringify([sentiment.timestamp, sentiment.score])
        )}]"
      ></google-chart>

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
   */
  _handleChartSelection() {
    const googleChart = this.shadowRoot.querySelector('google-chart');

    this.selectedSentiments = [];

    for (const selection of googleChart.selection) {
      const selectedRow = selection.row || 0;

      const selectedPoint = googleChart.rows[selectedRow];

      this.query?.data?.sentiments?.forEach((sentiment) => {
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
    this.mutation.variables = {
      economicEntityName: companyName,
      economicEntityType: 'BUSINESS',
    };
  }

  /**
   * Find the selected business and add it to the query variables.
   */
  _onSelect() {
    const businessName = this.shadowRoot.querySelector(
      '[aria-selected="true"]'
    ).value;
    this.query.variables = {
      economicEntityName: businessName,
      economicEntityType: 'BUSINESS',
    };
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
