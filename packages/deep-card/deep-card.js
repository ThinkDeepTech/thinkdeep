/* eslint-disable no-unused-vars */

import {html, LitElement, css} from 'lit';

/**
 * Card component.
 */
export class DeepCard extends LitElement {
  /**
   * Styles for lit component.
   */
  static get styles() {
    return [
      css`
        :host {
          transition: box-shadow 0.3s;
          min-width: 60vw;
          max-width: 90vw;
          min-height: 22vh;
          width: var(--width, 90vw);
          height: var(--height, 22vh);
          border-radius: 5px;
          background-color: var(--background-color, white);
        }

        :host(:hover) {
          box-shadow: 0 0 8px var(--shadow-color, gray);
        }

        .header ::slotted(*) {
          margin-left: 15px;
          margin-top: 15px;
        }

        .footer ::slotted(*) {
          margin-left: 15px;
          margin-bottom: 15px;
          margin-top: 15px;
        }

        a {
          display: flex;
          flex-direction: column;
        }
      `,
    ];
  }

  /**
   * Lit render function.
   * @return {TemplateResult}
   */
  render() {
    return html`
      <a>
        <div class="header">
          <slot name="header"></slot>
        </div>
        <div class="body">
          <slot name="body"></slot>
        </div>
        <div class="footer">
          <slot name="footer"></slot>
        </div>
      </a>
    `;
  }
}

customElements.define('deep-card', DeepCard);
