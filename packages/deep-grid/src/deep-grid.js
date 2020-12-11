import { html, LitElement, customElement, css } from 'lit-element';

/* eslint-disable no-unused-vars */
@customElement('deep-grid')
class DeepGrid extends LitElement {
  static get styles() {
    return css``;
  }

  render() {
    return html`
      ${this.styles}

      <div id="root">
        <slot></slot>
      </div>
    `;
  }
}
