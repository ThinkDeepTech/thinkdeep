import { css, html, LitElement, customElement } from 'lit-element';

import '@thinkdeep/deep-navbar';

/* eslint-disable no-unused-vars */
@customElement('deep-template-consultancy')
class DeepTemplateConsultancy extends LitElement {
  static get styles() {
    return css`
      .page {
        display: grid;
        grid-template-rows: repeat(12, 1fr);
        background-color: yellow;
      }
      div {
        background-color: green;
      }
    `;
  }

  render() {
    return html`
      ${this.styles}

      <div class="page">
        <deep-navbar></deep-navbar>
        <deep-banner></deep-banner>
        <div>
          Magical
          <p>something</p>
        </div>
        <deep-section></deep-section>
        <div>Third Thing</div>
        <deep-footer></deep-footer>
      </div>
    `;
  }
}
