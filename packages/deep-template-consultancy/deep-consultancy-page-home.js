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
        top: 0;
        left: 0;
        transform: translate(50%, 300%);
        z-order: 100;
        width: 50vw;
        height: 10vh;
        text-align: center;
      }

      .contact-us {
        position: absolute;
        top: 0;
        left: 0;
        transform: translate(150%, 500%);
        height: 8vh;
        width: 25vw;
      }

      @media screen and (max-width: 768px) {
        .headline {
          position: absolute;
          top: 0;
          left: 0;
          transform: translate(50%, 200%);
          z-order: 100;
          width: 50vw;
          height: 10vh;
          text-align: center;
        }
      }
    `;
  }
  render() {
    return html`
      <div class="banner"></div>
      <h1 class="headline">Tech solved.</h1>
      <button class="contact-us" type="button">Email Us</button>
    `;
  }
}

customElements.define('deep-consultancy-page-home', DeepConsultancyPageHome);
