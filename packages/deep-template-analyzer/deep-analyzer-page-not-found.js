import {html, LitElement} from 'lit-element';

export class DeepAnalyzerPageNotFound extends LitElement {
  render() {
    return html` <div>Page not found! :-/</div> `;
  }
}

customElements.define('deep-analyzer-page-not-found', DeepAnalyzerPageNotFound);
