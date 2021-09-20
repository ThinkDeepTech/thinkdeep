import {html, css, LitElement} from 'lit-element';
import {i18nMixin} from 'lit-element-i18n';
import '@thinkdeep/deep-button/deep-button';

export class DeepAnalyzerPageHome extends i18nMixin(LitElement) {
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
        transform: translate(50%, 275%);
        z-order: 100;
        width: 50vw;
        height: 10vh;
        text-align: center;
      }

      deep-button {
        position: absolute;
        top: 0;
        left: 0;
        transform: translate(150%, 500%);
        height: 8vh;
        width: 25vw;
        z-order: 100;
      }
    `;
  }

  firstUpdated() {
    this.i18nInit();
    this.addResources('en', 'translations', {
      headline: 'Explore data.',
      buttonText: 'Get Started',
    });

    this.addResources('fr', 'translations', {
      headline: 'Something different here',
      buttonText: 'Get Started Differently?',
    });
  }

  render() {
    return html`
      <div class="banner"></div>
      <h1 class="headline">${this.translate('translations:headline')}</h1>
      <deep-button>${this.translate('translations:buttonText')}</deep-button>
    `;
  }
}

customElements.define('deep-analyzer-page-home', DeepAnalyzerPageHome);
