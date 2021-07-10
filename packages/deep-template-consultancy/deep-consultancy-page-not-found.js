import { html, LitElement } from 'lit-element';

export class DeepConsultancyPageNotFound extends LitElement {
  render() {
    return html`
      <div>We couldn't find what you were looking for. Are you sure the URL is correct?</div>
    `;
  }
}

customElements.define('deep-consultancy-page-not-found', DeepConsultancyPageNotFound);
