import { css, html, LitElement, customElement } from 'lit-element';

import '@thinkdeep/deep-navbar';

/* eslint-disable no-unused-vars */
@customElement('deep-template-consultancy')
class DeepTemplateConsultancy extends LitElement {
  static get styles() {
    return css``;
  }

  render() {
    return html`
      ${this.styles}

      <deep-navbar></deep-navbar>
      <deep-banner></deep-banner>
      <deep-section></deep-section>
      <deep-footer></deep-footer>
    `;
  }
}
