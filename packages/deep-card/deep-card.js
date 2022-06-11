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
          width: var(--width, 90vw);
          max-width: 90vw;
          border-radius: 5px;
          background-color: var(--background-color, white);
          min-height: 22vh;
          max-height: 40vh;
        }

        :host:hover {
          box-shadow: 0 0 20px var(--shadow-color, black);
        }

        .header ::slotted(*) {
          margin: 5vw;
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
