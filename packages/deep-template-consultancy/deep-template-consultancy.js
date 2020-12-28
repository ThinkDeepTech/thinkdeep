import { css, html, LitElement, customElement, property } from 'lit-element';

import '@thinkdeep/deep-navbar';

/* eslint-disable no-unused-vars */
@customElement('deep-template-consultancy')
class DeepTemplateConsultancy extends LitElement {
  @property({ type: Array }) sections = [
    {
      name: 'home',
    },
    {
      name: 'skills',
    },
    {
      name: 'contact-me',
    },
  ];

  static get styles() {
    return css``;
  }

  render() {
    return html`
      ${this.styles}

      <deep-navbar></deep-navbar>
      <deep-banner></deep-banner>
      <deep-section></deep-section>

      ${this.sections.map(
        (section) => html`
          <h2 class="section">${section.name}</h2>
          <p>Some paragraph text</p>
        `
      )}

      <deep-footer></deep-footer>
    `;
  }
}
