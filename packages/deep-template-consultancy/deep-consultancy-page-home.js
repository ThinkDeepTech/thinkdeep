import {html, css, LitElement} from 'lit-element';
import '@thinkdeep/deep-button/deep-button';

export class DeepConsultancyPageHome extends LitElement {
  static get properties() {
    return {
      slogan: {type: String},
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

      .contact {
        position: absolute;
        top: 0;
        left: 0;
        transform: translate(150%, 500%);
        height: 8vh;
        width: 25vw;
        z-order: 100;
      }

      @media screen and (max-width: 480px) {
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
      }

      @media screen and (min-width: 481px) and (max-width: 769px) {
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
      }
    `;
  }
  render() {
    return html`
      <div class="banner"></div>
      <h1 class="headline">Tech solved.</h1>
      <deep-button class="contact">Contact Us</deep-button>
    `;
  }
}

customElements.define('deep-consultancy-page-home', DeepConsultancyPageHome);
