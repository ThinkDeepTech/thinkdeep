import {html, css, LitElement} from 'lit-element';

export class DeepNavLink extends LitElement {
  static get properties() {
    return {
      /** Vaadin route */
      route: {type: Object},
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

  async firstUpdated() {
    // Give the browser a chance to paint
    await new Promise((r) => setTimeout(r, 0));
    this.addEventListener('click', this._handleClick);
  }

  render() {
    return html` <p>
      <a href="${this.route.path}"> ${this.route.name} </a>
    </p>`;
  }

  /**
   * Pass the click to the anchor tag.
   */
  _handleClick(e) {
    const anchor = this.shadowRoot.querySelector('a');
    anchor.click();
  }
}
customElements.define('deep-navlink', DeepNavLink);
