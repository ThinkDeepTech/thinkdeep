import { html, LitElement, css } from 'lit-element';

/* eslint-disable no-unused-vars */
export class DeepNavbar extends LitElement {
  static get properties() {
    return {
      logo: { type: String },
      menuItems: { type: Array },
    };
  }

  constructor() {
    super();
    this.logo = '';
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

      .logo {
        grid-column-start: 1;
        grid-column-end: 1;
        align-self: center;
        text-align: center;
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

        ${this.menuItems.map(
          (item, index) =>
            html`<a
              class="menu-item"
              style="grid-column-start: ${-1 * this.menuItems.length - 1 + index};"
            >
              ${item.label}
            </a>`
        )}
      </div>
    `;
  }
}

customElements.define('deep-navbar', DeepNavbar);
