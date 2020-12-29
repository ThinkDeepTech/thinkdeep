/* eslint-disable no-unused-vars */

import { css, html, LitElement, customElement, property } from 'lit-element';

import { Button } from 'smart-webcomponents/source/smart.elements';

import '@thinkdeep/deep-navbar';

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

      <!-- TODO: Figure out layout and implement (i.e, grid layout, what arch style) -->

      <deep-navbar></deep-navbar>
      <deep-banner></deep-banner>
      <deep-section></deep-section>

      <smart-button class="raised">Button</smart-button>

      <deep-footer></deep-footer>
    `;
  }
}
