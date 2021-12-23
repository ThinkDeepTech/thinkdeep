import {html, LitElement} from 'lit';
import {i18nMixin} from 'lit-element-i18n';

export class DeepAnalyzerPageNotFound extends i18nMixin(LitElement) {
  render() {
    return html`
      <div>${this.translate('translations:notFoundPageContent')}</div>
    `;
  }
}

customElements.define('deep-analyzer-page-not-found', DeepAnalyzerPageNotFound);
