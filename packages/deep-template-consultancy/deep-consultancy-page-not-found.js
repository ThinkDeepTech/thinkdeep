import {html, LitElement} from 'lit';

export class DeepConsultancyPageNotFound extends LitElement {
  render() {
    return html` <div>Page not found! :-/</div> `;
  }
}

customElements.define(
  'deep-consultancy-page-not-found',
  DeepConsultancyPageNotFound
);
