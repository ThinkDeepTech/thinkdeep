import { html, css, LitElement } from 'lit-element';

export class DeepNavLink extends LitElement {
  static get properties() {
    return {
      /** Vaadin route */
      route: { type: Object },
    };
  }
  constructor() {
    super();

    this.route = {};
  }

  static get styles() {
    return css`
      :host {
        height: inherit;
        width: inherit;
      }

      a {
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

      p {
        margin-top: 7vh;
        text-align: center;
      }
    `;
  }

  render() {
    return this.route.path != undefined
      ? html` <p>
          <a href="${this.route.path}"> ${this.route.name} </a>
        </p>`
      : html``;
  }
}
customElements.define('deep-navlink', DeepNavLink);
