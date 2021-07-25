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
        grid-gap: 0.6rem;
        grid-template-columns: repeat(12, 1fr);
        height: 100px;
        width: auto;
        background-color: var(--primary-color, #7a9e9f);
      }

      .logo {
        grid-column-start: 1;
        grid-column-end: 1;
        align-self: center;
        text-align: center;
        height: inherit;
        width: inherit;
      }

      a {
        height: 100%;
        width: minmax(125px, auto);
        text-align: center;
      }

      a[hidden] {
        display: none;
        visibility: hidden;
      }

      img {
        height: 100%;
        width: auto;
      }
    `;
  }

  render() {
    return html`
      <div class="navbar">
        <div class="logo">
          <img src="${this.logo}" />
        </div>

        ${this.routes.map(
          (item, index) => html`<a
            style="grid-column-start: ${-1 * this.routes.length - 1 + index};"
            href="${item.path}"
            ?hidden="${item.hidden}"
          >
            ${item.name}
          </a>`
        )}
      </div>
    `;
  }
}

customElements.define('deep-navbar', DeepNavbar);
