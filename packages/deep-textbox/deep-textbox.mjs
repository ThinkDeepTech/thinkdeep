import {html, css, LitElement} from 'lit';

export class DeepTextbox extends LitElement {
  static get properties() {
    return {
      placeholder: { type: String }
    };
  }

  constructor() {
    super();

    this.placeholder = '';
  }

  static get styles() {
    return [css`

    `];
  }
  render() {
    return html`
      <input type="text" placeholder="${this.placeholder}"/>
    `;
  }
}

customElements.define('deep-textbox', DeepTextbox);
