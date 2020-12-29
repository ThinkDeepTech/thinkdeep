import { html, LitElement, property, customElement, css } from 'lit-element';

/* eslint-disable no-unused-vars */
@customElement('deep-grid-layout')
class DeepGridLayout extends LitElement {
  @property({ type: Number }) numColumns = 12;

  static get styles() {
    return css`
      div {
        display: grid;
      }
    `;
  }

  render() {
    return html`
      <div>
        <p>First</p>
        <p>Second</p>
        <p>Third</p>
      </div>
    `;
  }
}
