import { css, html, LitElement, customElement } from 'lit-element';

/* eslint-disable no-unused-vars */
@customElement('deep-template-consultancy')
class DeepTemplateConsultancy extends LitElement {
  static get styles() {
    return css`
      deep-grid {
      }
    `;
  }

  render() {
    return html`

      <deep-navbar></deep-navbar>
      <deep-banner></deep-banner>
      <deep-section></deep-section>
      <deep-footer></deep-footer>

    `;
  }
}
