import { html, LitElement } from 'lit-element';

/* eslint-disable no-unused-vars */
class DeepNavbar extends LitElement {
  render() {
    return html`
      <div>
        <p>In navbar</p>
      </div>
    `;
  }
}

customElements.define('deep-navbar', DeepNavbar);
