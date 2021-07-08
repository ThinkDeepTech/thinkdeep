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
    this.menuItems = [
      {
        label: 'Home',
      },
      {
        label: 'About',
      },
    ];
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

      .logo {
        grid-column-start: 1;
        grid-column-end: 1;
      }

      .menu-item {
        height: 100%;
        width: 100%;
        text-align: center;
        justify-content: center;
        align-items: center;
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
