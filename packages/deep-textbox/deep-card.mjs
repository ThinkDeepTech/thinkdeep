import {html, css, LitElement} from 'lit';

export class DeepCard extends LitElement {
  static get styles() {
    return [css`

    `];
  }
  render() {
    return html`
      <slot name="title"></slot>
      <slot></slot>
    `;
  }
}

customElements.define('deep-card', DeepCard);
