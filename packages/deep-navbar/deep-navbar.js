import { html, LitElement, css } from 'lit-element';

/* eslint-disable no-unused-vars */
export class DeepNavbar extends LitElement {
  static get properties() {
    return {
      logo: { type: String },
      routes: { type: Array },
    };
  }

  constructor() {
    super();
    this.logo = '';
    this.routes = [];
  }

  static get styles() {
    return css`
      .navbar {
        display: grid;
        grid-template-columns: repeat(12, 1fr);
        height: 100px;
        width: auto;
        background-color: blue;
      }

      .logo {
        grid-column-start: 1;
        grid-column-end: 1;
        align-self: center;
        text-align: center;
      }

      a {
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

        ${this.routes.map(
          (item, index) =>
            html`<a
              style="grid-column-start: ${-1 * this.routes.length - 1 + index};"
              href="${item.path}"
            >
              ${item.name}
            </a>`
        )}
      </div>
    `;
  }
}

customElements.define('deep-navbar', DeepNavbar);
