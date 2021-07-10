import { html, LitElement, css } from 'lit-element';

export class DeepMenuItem extends LitElement {
  static get properties() {
    return {
      path: { type: String },
    };
  }

  static get styles() {
    return css`
      a {
        color: green;
      }

      a:hover {
        color: red;
      }
    `;
  }

  render() {
    return html` <a href="${this.path}">Link</a> `;
  }
}

customElements.define('deep-menu-item', DeepMenuItem);
