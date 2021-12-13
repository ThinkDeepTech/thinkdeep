import {html, LitElement} from 'lit';
import {i18nMixin} from 'lit-element-i18n';

export class DeepAnalyzerPageNotFound extends i18nMixin(LitElement) {
  async firstUpdated() {
    super.firstUpdated();

    this.i18nInit('translations', {
      'en-US': {
        translations: await import('./locales/en-US/common.js'),
      },
      'en-CA': {
        translations: await import('./locales/en-CA/common.js'),
      },
    });
  }
  render() {
    return html`
      <div>${this.translate('translations:notFoundPageContent')}</div>
    `;
  }
}

customElements.define('deep-analyzer-page-not-found', DeepAnalyzerPageNotFound);
