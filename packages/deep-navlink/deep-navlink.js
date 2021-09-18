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
    return css``;
  }

  render() {
    return html``;
  }
}
customElements.define('deep-navlink', DeepNavLink);
