import { html, css, LitElement } from 'lit-element';

export class DeepConsultancyPageHome extends LitElement {
  static get properties() {
    return {
      slogan: { type: String },
    };
  }

  static get styles() {
    return css`
      :host {
        position: relative;
      }

      .banner {
        background: url('img/nasa-unsplash.jpg') no-repeat center center fixed;
        background-size: cover;
        height: 600px;
        width: 100%;
      }

      .headline {
        position: absolute;
        top: 250px;
        left: 300px;
        z-order: 100;
        width: 50vw;
        height: 10vh;
      }

      .contact-us {
        position: absolute;
        top: 350px;
        left: 375px;
        height: 8vh;
        width: 25vw;
      }
    `;
  }
  render() {
    return html`
      <div class="banner"></div>
      <h1 class="headline">Give us a problem, we'll give a solution.</h1>
      <button class="contact-us" type="button">Email Us</button>
    `;
  }
}

customElements.define('deep-consultancy-page-home', DeepConsultancyPageHome);
