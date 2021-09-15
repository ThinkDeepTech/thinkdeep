import { html, LitElement, css } from 'lit-element';

import defaultStyles from '@thinkdeep/deep-styles/default-styles';

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
    return [
      defaultStyles,
      css`
        :host {
          display: grid;
          grid-gap: 0.6rem;
          grid-template-columns: repeat(3, 1fr);
          width: inherit;
          height: 150px;
          background-color: var(--primary-color, #558b2f);
        }

        .copyright {
          grid-column-start: 3;
          grid-row-start: 3;
          text-align: center;
        }
      `,
    ];
  }

  render() {
    return html`
      <slot name="helpful-links"></slot>
      <slot name="address"></slot>
      <slot name="copyright"></slot>
    `;
  }
}

customElements.define('deep-footer', DeepFooter);
