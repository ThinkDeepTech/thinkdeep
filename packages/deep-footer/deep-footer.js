import { html, LitElement, css } from 'lit-element';

/* eslint-disable no-unused-vars */
export class DeepFooter extends LitElement {
  static get properties() {
    return {
      company: { type: String },
    };
  }

  constructor() {
    super();
    this.company = '';
  }

  static get styles() {
    return css`
      :host {
        display: grid;
        grid-gap: 0.6rem;
        grid-template-columns: repeat(3, 1fr);
        width: inherit;
        height: 150px;
        background-color: var(--primary-color, #7a9e9f);
      }

      .copyright {
        grid-column-start: 3;
        grid-row-start: 3;
        text-align: center;
      }
    `;
  }

  render() {
    return html`
      <div class="copyright">
        ${this.company.length > 0 ? '\u00A9' + this.company + ', ' + new Date().getFullYear() : ''}.
      </div>
    `;
  }
}

customElements.define('deep-footer', DeepFooter);
