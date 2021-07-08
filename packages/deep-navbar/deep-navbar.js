import { html, LitElement, css } from 'lit-element';
import '@polymer/app-layout/app-header-layout/app-header-layout.js';

/* eslint-disable no-unused-vars */
class DeepNavbar extends LitElement {
  static get properties() {
    return {
      logo: { type: String },
      menuItems: { type: Array },
    };
  }

  constructor() {
    super();
    this.menuItems = [];
  }

  static get styles() {
    return css`
      .navbar {
        display: grid;
        grid-template-columns: repeat(12, 1fr);
        height: 100px;
        width: auto;
        background-color: red;
      }

      .menu-item {
        align-self: flex-end;
        height: 100%:
        width: auto;
        grid-column-start: 4;
      }
    `;
  }

  render() {
    return html`
      <div class="navbar">
        <div class="logo">${this.logo}</div>

        ${this.menuItems.map((item) => html`<button class="menu-item">${item.label}</button>`)}
      </div>
    `;
  }
}

customElements.define('deep-navbar', DeepNavbar);
