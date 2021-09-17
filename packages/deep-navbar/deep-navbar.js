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
        nav {
          display: grid;
          grid-gap: 0.6rem;
          grid-template-columns: repeat(12, 1fr);
          align-items: center;

          height: 100px;
          width: auto;
          background-color: var(--primary-color, #558b2f);
        }

        slot[name='logo'] {
          grid-column-start: 1;
          grid-column-end: 1;
          height: inherit;
          width: inherit;
        }

        a {
          display: block;
          height: 100%;
          width: 100%;
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
      `,
    ];
  }

  render() {
    return html`
      <nav>
        <slot name="logo">
          <h1>${this.companyName}</h1>
        </slot>

        ${this.routes.map(
          (item, index) => html` <a
            style="grid-column-start: ${-1 * this.routes.length - 1 + index};"
            href="${item.path}"
            ?hidden="${item.hidden}"
          >
            ${item.label}
          </a>`
        )}
      </nav>
    `;
  }
}

customElements.define('deep-navbar', DeepNavbar);
