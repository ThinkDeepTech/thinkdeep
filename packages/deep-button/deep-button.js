import { html, LitElement } from "@polymer/lit-element/lit-element";

export class DeepButton extends LitElement {
  _render() {
    return html`
      <button>${this.label}</button>
    `;
  }
  constructor() {
    super();
    this.label = "";
  }
  static get properties() {
    return {
      label: String
    };
  }
}

window.customElements.define("deep-button", DeepButton);
