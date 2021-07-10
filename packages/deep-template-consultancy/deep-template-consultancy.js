import { css, html, LitElement } from 'lit-element';

import '@thinkdeep/deep-navbar';
import { Router } from '@vaadin/router';

import '@thinkdeep/deep-template-consultancy/deep-consultancy-home';
import '@thinkdeep/deep-template-consultancy/deep-consultancy-about';

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
        label: 'Home',
        component: 'deep-consultancy-home',
      },
      {
        path: '/about',
        name: 'about',
        label: 'About',
        component: 'deep-consultancy-about',
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

      <deep-navbar class="navbar" logo="//logo.jpg" .routes="${this.routes}"></deep-navbar>

      <main role="main" id="content"></main>

      <deep-footer>Footer</deep-footer>
    `;
  }
}

customElements.define('deep-template-consultancy', DeepTemplateConsultancy);
