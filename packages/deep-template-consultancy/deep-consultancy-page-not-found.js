import { html, LitElement } from 'lit-element';

export class DeepConsultancyPageNotFound extends LitElement {
  render() {
    return html` <div>Page wasnt found! :-/</div> `;
  }
}

customElements.define('deep-consultancy-page-not-found', DeepConsultancyPageNotFound);
