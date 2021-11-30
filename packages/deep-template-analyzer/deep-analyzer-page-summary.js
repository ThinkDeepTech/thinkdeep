import {ApolloQuery, html} from '@apollo-elements/lit-apollo';
import SearchQuery from './graphql/search.query.graphql';

export default class DeepAnalyzerPageSummary extends ApolloQuery {
  constructor() {
    super();

    this.query = SearchQuery;

    this.variables = {
      businessName: 'Google',
    };
  }

  render() {
    return html`
      Hi
      ${this.data?.search?.map(
        (business) => html`<p>${business.id} : ${business.name}</p>`
      )}
    `;
  }
}

customElements.define('deep-analyzer-page-summary', DeepAnalyzerPageSummary);
