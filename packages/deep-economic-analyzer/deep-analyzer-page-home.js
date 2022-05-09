import {html, css, LitElement} from 'lit';
import {i18nMixin, translate} from 'lit-element-i18n';

export class DeepAnalyzerPageHome extends i18nMixin(LitElement) {
  static get styles() {
    return css`
      :host {
        position: relative;
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
    `;
  }

  render() {
    return html`
      <h1 class="headline">${translate('translations:headline')}</h1>
    `;
  }
}

customElements.define('deep-analyzer-page-home', DeepAnalyzerPageHome);
