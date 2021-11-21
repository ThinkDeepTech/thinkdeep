import {html, css, LitElement} from 'lit-element';
import {i18nMixin, translate} from 'lit-element-i18n';

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
        width: 50vw;
        height: 10vh;
        text-align: center;
        z-index: 1;
      }

      deep-button {
        position: absolute;
        top: 0;
        left: 0;
        transform: translate(150%, 500%);
        height: 8vh;
        width: 25vw;
        z-index: 1;
      }
    `;
  }

  async firstUpdated() {
    super.firstUpdated();
    await this.i18nInit(
      'translations',
      {
        'en-US': {
          translations: await import('./locales/en-US/common.js').default,
        },
        'en-CA': {
          translations: await import('./locales/en-CA/common.js').default,
        },
      },
      'translations'
    );
  }

  render() {
    return html`
      <div class="banner"></div>
      <h1 class="headline">${translate('translations:headline')}</h1>
    `;
  }
}

customElements.define('deep-analyzer-page-home', DeepAnalyzerPageHome);
