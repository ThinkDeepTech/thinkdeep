import { html, LitElement, css } from 'lit-element';

/* eslint-disable no-unused-vars */
export class DeepNavbar extends LitElement {
  static get properties() {
    return {
      companyName: { type: String },
      routes: { type: Array },
    };
  }

  constructor() {
    super();
    this.companyName = '';
    this.routes = [];
  }

  static get styles() {
    return [
      css`
        .navbar {
          display: grid;
          grid-gap: 0.6rem;
          grid-template-columns: repeat(12, 1fr);
          height: 100%;
          width: auto;
          background-color: var(--primary-color, #558b2f);
        }

        slot[name='logo'] {
          grid-column-start: 1;
          grid-column-end: 1;
          text-align: center;
          height: inherit;
          width: inherit;
        }

        a {
          display: block;
          height: 100%;
          width: 100%;
          text-align: center;
          color: var(--secondary-color, black);
        }

        a:link {
          text-decoration: none;
        }

        a:visited {
          text-decoration: none;
          color: var(--secondary-color-dark, black);
        }

        a:hover {
          text-decoration: none;
          color: var(--secondary-color-light, black);
        }

        a:active {
          text-decoration: none;
        }

        a[hidden] {
          display: none;
          visibility: hidden;
        }

        img {
          height: 100%;
          width: auto;
        }
      `,
    ];
  }

  render() {
    return html`
      <div class="navbar">
        <slot name="logo">
          <h1>${this.companyName}</h1>
        </slot>

        ${this.routes.map(
          (item, index) => html` <a
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
