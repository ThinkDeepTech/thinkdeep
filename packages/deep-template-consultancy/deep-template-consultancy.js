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
        label: 'Home',
      },
      {
        label: 'About',
      },
      {
        label: 'Contact',
      },
    ];
  }

  static get styles() {
    return css`
      :host {
        display: grid;
        grid-template-rows: repeat(12, 1fr);
        grid-template-areas:
          'header'
          'banner'
          'banner'
          'banner'
          'banner'
          'banner'
          'banner'
          'banner'
          'banner'
          'banner'
          'banner'
          'footer';
        background-color: yellow;
      }

      deep-navbar {
        grid-area: header;
      }

      deep-banner {
        grid-area: banner;
      }

      deep-footer {
        grid-area: footer;
      }
    `;
  }

  render() {
    return html`
      ${this.styles}

      <deep-navbar
        class="navbar"
        logo="//Path to logo.jpg"
        .menuItems="${this.menuItems}"
      ></deep-navbar>
      <deep-banner class="banner">Banner</deep-banner>
      <deep-footer class="footer">Footer</deep-footer>
    `;
  }
}

customElements.define('deep-template-consultancy', DeepTemplateConsultancy);
