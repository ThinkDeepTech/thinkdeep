import { css, html, LitElement } from 'lit-element';

import '@thinkdeep/deep-navbar';

/* eslint-disable no-unused-vars */
class DeepTemplateConsultancy extends LitElement {
  static get properties() {
    return {
      menuItems: { type: Array },
    };
  }

  constructor() {
    super();
    this.menuItems = [
      {
        label: 'About',
      },
      {
        label: 'Contact Me',
      },
    ];
  }

  static get styles() {
    return css`
      :host {
        display: grid;
        grid-template-rows: repeat(12, 1fr);
        background-color: yellow;
      }
    `;
  }

  render() {
    return html`
      ${this.styles}

      <deep-navbar logo="//Path to logo.jpg" menu-items="${this.menuItems}"></deep-navbar>
      <deep-banner></deep-banner>
      <deep-section></deep-section>
      <deep-footer></deep-footer>
    `;
  }
}

customElements.define('deep-template-consultancy', DeepTemplateConsultancy);
