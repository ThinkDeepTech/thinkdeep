import { html, LitElement, customElement, property } from 'lit-element';

/* eslint-disable no-unused-vars */
@customElement('deep-template-consultancy')
class DeepTemplateConsultancy extends LitElement {
  /**
   * Represents site context (state) at any given point.
   */
  @property({ type: Object })
  _context = {};

  render() {
    return html`

      <deep-grid>
        <deep-column>

        </deep-column>
        <deep-column>

        </deep-column>
        <deep-column>

        </deep-column>
      </deep-grid>

      <!-- TODO: Include bubble-button-like behavior for floating menu -->
      <deep-navbar></deep-navbar>
      <deep-banner></deep-banner>

      <deep-section>

      </deep-section>

      <deep-footer></deep-footer>
    `;
  }
}
