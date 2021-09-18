import { html, css, LitElement } from 'lit-element';

export class DeepConsultancyPageHome extends LitElement {
  static get properties() {
    return {
      slogan: { type: String },
    };
  }

  constructor() {
    super();

    this.slogan = '';
  }

  static get styles() {
    return css`
    .banner {
      background: url('img/nasa-unsplash.jpg') no-repeat center center fixed;
      background-size: cover;
      height: 600px;
      width: 100%;
    }
    .slogan {
      position: absolute;
      top: 50vw;
      left 50vw;
    }
    `;
  }
  render() {
    return html` <div class="banner"></div> `;
  }
}

customElements.define('deep-consultancy-page-home', DeepConsultancyPageHome);
