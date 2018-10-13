import { html, LitElement } from "@polymer/lit-element";

export class DeepButton extends LitElement {
  render() {
    return html`
      <button>${this.label}</button>
    `;
  }
  static get properties() {
    return {
      label: String
    };
  }
}

window.customElements.define("deep-button", DeepButton);
