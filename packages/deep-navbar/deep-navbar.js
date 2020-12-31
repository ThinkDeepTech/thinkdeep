import { html, LitElement, customElement, css } from 'lit-element';
import '@polymer/app-layout/app-header-layout/app-header-layout.js';

/* eslint-disable no-unused-vars */
@customElement('deep-navbar')
class DeepNavbar extends LitElement {
  static get styles() {
    return css``;
  }

  render() {
    return html`
      <nav>
        <a href="home">Home</a>
        <a href="about">About</a>
        <a href="contact">Contact</a>
      </nav>
    `;
  }
}
