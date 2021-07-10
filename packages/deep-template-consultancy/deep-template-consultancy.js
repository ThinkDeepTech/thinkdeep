import { css, html, LitElement } from 'lit-element';

import '@thinkdeep/deep-navbar';
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

    this.location = Router.location;
    this.menuItems = [
      {
        label: 'Home',
        path: '/',
      },
      {
        label: 'About',
        path: '/about',
      },
    ];
  }

  firstUpdated() {
    super.firstUpdated();

    const targetViewingArea = this.shadowRoot.getElementById('content');
    const router = new Router(targetViewingArea);
    router.setRoutes([
      {
        path: '/',
        name: 'home',
        component: 'deep-consultancy-home',
        action: async () => {
          await import('@thinkdeep/deep-template-consultancy/deep-consultancy-home');
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

      <main role="main" id="content"></main>

      <deep-footer>Footer</deep-footer>
    `;
  }
}

customElements.define('deep-template-consultancy', DeepTemplateConsultancy);
