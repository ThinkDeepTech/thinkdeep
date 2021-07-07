import { html, LitElement, property, customElement, css } from 'lit-element';
import '@polymer/app-layout/app-header-layout/app-header-layout.js';

/* eslint-disable no-unused-vars */
@customElement('deep-navbar')
class DeepNavbar extends LitElement {
  @property({ type: String }) name = 'changed thing';

  static get styles() {
    return css`
      .navbar {
        height: 100px;
        width: auto;
        background-color: red;
      }
    `;
  }

  render() {
    return html` <div class="navbar">In navbar. Name: ${this.name}</div> `;
  }
}
