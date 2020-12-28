import { html, LitElement, property, customElement } from 'lit-element';

/* eslint-disable no-unused-vars */
@customElement('deep-navbar')
class DeepNavbar extends LitElement {
  @property({ type: String }) name = 'thing';

  render() {
    return html`
      <div>
        <p>In navbar. Name: ${this.name}</p>
      </div>
    `;
  }
}
