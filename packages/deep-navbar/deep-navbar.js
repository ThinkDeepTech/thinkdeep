import { html, LitElement, property, customElement, css } from 'lit-element';
import '@polymer/app-layout/app-header-layout/app-header-layout.js';

/* eslint-disable no-unused-vars */
@customElement('deep-navbar')
class DeepNavbar extends LitElement {
  @property({ type: String }) name = 'changed thing';

  static get styles() {
    return css`
      div {
        background-color: red;
      }
    `;
  }

  render() {
    return html`
      <div>
        <p>In navbar. Name: ${this.name}</p>
      </div>
    `;
  }
}
