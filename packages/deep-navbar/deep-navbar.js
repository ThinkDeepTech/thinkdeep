import {html, LitElement, css} from 'lit-element';

import '@thinkdeep/deep-navlink/deep-navlink';

/* eslint-disable no-unused-vars */
export class DeepNavbar extends LitElement {
  static get properties() {
    return {
      companyName: {type: String},
      routes: {type: Array},
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
          height: 100%;
        }
        nav {
          display: grid;
          grid-gap: 0.6rem;
          grid-template-columns: repeat(12, 1fr);
          align-items: center;

          height: inherit;
          width: auto;
          background-color: var(--primary-color, #757575);
        }

        deep-navlink {
          padding-right: 4vw;
        }

        slot[name='logo'],
        .logo {
          padding-left: 4vw;
        }
      `,
    ];
  }

  render() {
    return html`
      <nav>
        <slot name="logo">
          <h1 class="logo">${this.companyName}</h1>
        </slot>

        ${this._visibleMenuItems(this.routes)}
      </nav>
    `;
  }

  /**
   * Retrieve the markup for the visible menu items.
   *
   * NOTE: The -1 in the function below is done to reverse the routes array.
   *
   * @param {Array} routes - Vaadin routes.
   * @return {TemplateResult} Markup associated with routes.
   */
  _visibleMenuItems(routes) {
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
    return html`<deep-navlink
      .route="${route}"
      style="grid-column-start: ${12 - index};"
    ></deep-navlink>`;
  }
}

customElements.define('deep-navbar', DeepNavbar);
