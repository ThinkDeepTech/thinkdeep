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
        :host {
          height: 150px;
        }
        nav {
          display: grid;
          grid-gap: 0.6rem;
          grid-template-columns: repeat(14, 1fr);
          align-items: center;

          height: inherit;
          width: auto;
          background-color: var(--primary-color, #558b2f);
        }

        slot[name='logo'] {
          grid-column-start: 2;
          grid-column-end: 2;
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
      `,
    ];
  }

  render() {
    return html`
      <nav>
        <slot name="logo">
          <h1>${this.companyName}</h1>
        </slot>

        ${this._visibleMenuItems(this.routes)}
      </nav>
    `;
  }

  /**
   * Retrieve the markup for the visible menu items.
   * @param {Array} routes - Vaadin routes.
   * @return {TemplateResult} Markup associated with routes.
   */
  _visibleMenuItems(routes) {
    // NOTE: The -1 * index in the function below is done to reverse the routes array.
    return routes.map((route, index) =>
      route.hidden ? html`` : this._menuItem(route, -1 * index)
    );
  }

  /**
   * Retrieve the route as menu item markup.
   * @param {Object} route - Route to be converted.
   * @param {Number} index - Index order at which the route is located in the routes array.
   * @return {TemplateResult} Markup associated with menu item.
   */
  _menuItem(route, index) {
    return route
      ? html` <div style="grid-column-start: ${14 - index};">
          <a href="${route.path}"> ${route.name} </a>
        </div>`
      : html``;
  }
}

customElements.define('deep-navbar', DeepNavbar);
