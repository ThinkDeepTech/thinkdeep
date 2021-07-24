import { css, html, LitElement } from 'lit-element';

import '@thinkdeep/deep-navbar';
import { Router } from '@vaadin/router';

import '@thinkdeep/deep-template-consultancy/deep-consultancy-page-home.js';
import '@thinkdeep/deep-template-consultancy/deep-consultancy-page-about.js';
import '@thinkdeep/deep-template-consultancy/deep-consultancy-page-not-found.js';

/* eslint-disable no-unused-vars */
export class DeepTemplateConsultancy extends LitElement {
  static get properties() {
    return {
      routes: { type: Array },
      location: { type: Object },
    };
  }

  constructor() {
    super();

    this.location = Router.location;
    this.routes = [
      {
        path: '/',
        name: 'home',
        component: 'deep-consultancy-page-home',
      },
      {
        path: '/about',
        name: 'about',
        component: 'deep-consultancy-page-about',
      },
      {
        path: '(.*)',
        name: 'page-not-found',
        component: 'deep-consultancy-page-not-found',
        hidden: true,
      },
    ];
  }

  firstUpdated() {
    super.firstUpdated();

    const targetViewingArea = this.shadowRoot.getElementById('content');
    const router = new Router(targetViewingArea);
    const routes = this.routes;
    router.setRoutes(routes);
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

      <deep-navbar class="navbar" logo="//logo.jpg" .routes="${this.routes}"></deep-navbar>

      <main id="content"></main>

      <deep-footer>Footer</deep-footer>
    `;
  }
}

customElements.define('deep-template-consultancy', DeepTemplateConsultancy);
