import { html, LitElement, property, customElement } from '@polymer/lit-element';

/* eslint-disable no-unused-vars */
@customElement('deep-button')
class DeepButton extends LitElement {
  @property({ type: String })
  label = '';

  render() {
    return html`
      <button>${this.label}</button>
    `;
  }
}
