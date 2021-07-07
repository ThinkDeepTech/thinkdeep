import { css, html, LitElement, customElement } from 'lit-element';

import '@thinkdeep/deep-navbar';

/* eslint-disable no-unused-vars */
@customElement('deep-template-consultancy')
class DeepTemplateConsultancy extends LitElement {
  static get styles() {
    return css`
      :host {
        display: grid;
        grid-template-rows: repeat(12, 1fr);
        background-color: yellow;
      }
      div {
        background-color: gray;
      }
    `;
  }

  render() {
    return html`
      ${this.styles}

      <deep-navbar></deep-navbar>
      <div>Something</div>
      <deep-banner></deep-banner>
      <div>
        Magical
        <p>something</p>
      </div>
      <deep-section></deep-section>
      <div>Third Thing</div>
      <deep-footer></deep-footer>
    `;
  }
}
