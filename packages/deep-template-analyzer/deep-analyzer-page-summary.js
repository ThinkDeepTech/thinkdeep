import {
  ApolloMutationController,
  ApolloQueryController,
} from '@apollo-elements/core';
import {LitElement, css, html} from '@apollo-elements/lit-apollo';
import '@google-web-components/google-chart';
import '@material/mwc-button';
import '@material/mwc-list/mwc-list';
import '@material/mwc-list/mwc-list-item';
import '@material/mwc-select';
import '@material/mwc-textfield';
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
        display: grid;
        grid-template-columns: 1fr 1fr 1fr 1fr 1fr;
        grid-template-rows: 18vh 18vh 40vh;
        min-height: 80vh;
      }

      google-chart {
        grid-column-start: 1;
        grid-row-start: 3;
      }

      mwc-list {
        grid-column-start: 3;
        grid-column-end: 6;
        grid-row-start: 1;
        grid-row-end: 4;
        overflow: scroll;
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
      }

      .input {
        grid-column-start: 1;
        grid-column-end: 3;
      }

      .tweet {
        height: 16vh;
        width: 90%;
        color: var(--primary-color);
      }

      mwc-button {
        --mdc-theme-primary: var(--primary-color);
        --mdc-theme-on-primary: white;
      }

      mwc-textfield {
        --mdc-theme-primary: var(--primary-color);
      }
    `;
  }

  render() {
    return html`
      <div class="input">
        <label>${translate('translations:startCollectingLabel')}</label>
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
      </div>

      <div class="input">
        <label>${translate('translations:analyzeDataLabel')}</label>
        <mwc-select label="Select a business">
          <mwc-list-item selected value="Google">Google</mwc-list-item>
          <mwc-list-item value="Amazon">Amazon</mwc-list-item>
          <mwc-list-item value="PetCo">PetCo</mwc-list-item>
          <mwc-list-item value="Tesla">Tesla</mwc-list-item>
          <mwc-list-item value="Ford">Ford</mwc-list-item>
        </mwc-select>
      </div>

      <google-chart
        type="line"
        options='{"title": "Sentiment as a function of time" }'
        cols='[{"label": "Timestamp", "type": "number"}, {"label": "Sentiment", "type": "number"}]'
        rows="[${this.query?.data?.sentiments?.map((sentiment) =>
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
