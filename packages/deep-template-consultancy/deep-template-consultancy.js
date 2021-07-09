import { css, html, LitElement } from 'lit-element';

import '@thinkdeep/deep-navbar';
import '@thinkdeep/deep-template-consultancy/deep-consultancy-home';
import { Router } from '@vaadin/router';

/* eslint-disable no-unused-vars */
export class DeepTemplateConsultancy extends LitElement {
  static get properties() {
    return {
      menuItems: { type: Array },
      location: { type: Object },
    };
  }

  constructor() {
    super();
    this.menuItems = [
      {
        label: 'Home',
        path: '/',
      },
    ];

    this.location = Router.location;

    const targetViewingArea = document.getElementById('content');
    const router = new Router(targetViewingArea);
    router.setRoutes([
      {
        path: '/',
        component: './deep-consultancy-home',
        action: async () => {
          await import('./deep-consultancy-home');
        },
      },
    ]);
  }

  static get styles() {
    return css`
      :host {
        display: grid;
        grid-template-rows: repeat(7, 1fr);
        grid-template-areas:
          'header'
          'content'
          'content'
          'content'
          'content'
          'content'
          'footer';
        background-color: yellow;
      }

      deep-navbar {
        grid-area: header;
      }

      #content {
        grid-area: content;
      }

      deep-footer {
        grid-area: footer;
      }
    `;
  }

  render() {
    return html`
      ${this.styles}

      <deep-navbar class="navbar" logo="//logo.jpg" .menuItems="${this.menuItems}"></deep-navbar>

      <div id="content"></div>

      <deep-footer>Footer</deep-footer>
    `;
  }
}

customElements.define('deep-template-consultancy', DeepTemplateConsultancy);
