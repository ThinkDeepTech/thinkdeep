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
import './deep-site-configuration.mjs';
import {translate} from 'lit-element-i18n';
import CollectEconomicData from './graphql/CollectEconomicData.mutation.graphql';
import GetSentiment from './graphql/GetSentiment.query.graphql';

export default class DeepAnalyzerPageSummary extends LitElement {
  static get properties() {
    return {
      // Fetch sentiment query object
      getSentiment: {type: Object},

      // Data collection mutation object
      collectEconomicData: {type: Object},

      // The users site configuration.
      configuration: {type: Object},

      selectedSentiments: {type: Array},
    };
  }

  constructor() {
    super();

    this.getSentiment = new ApolloQueryController(this, GetSentiment, {
      variables: {
        economicEntityName: '',
        economicEntityType: 'BUSINESS',
      },
      noAutoSubscribe: true,
      onData: this._triggerUpdate.bind(this),
    });

    this.collectEconomicData = new ApolloMutationController(
      this,
      CollectEconomicData
    );

    this.configuration = {observedEconomicEntities: []};

    this.selectedSentiments = [];
  }

  connectedCallback() {
    super.connectedCallback();

    // TODO: Switch from addeventlistener to use of @ directive in custom elements.
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
        <label>${translate('translations:startCollectingLabel')}</label>
        <mwc-textfield
          label="Business name"
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
        <label>${translate('translations:analyzeDataLabel')}</label>
        <mwc-select label="Select a business">
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
    this.getSentiment.executeQuery();
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
