import {html, LitElement} from 'lit';
import {i18nMixin} from 'lit-element-i18n';

/**
 * Lit page not found component.
 */
export class DeepAnalyzerPageNotFound extends i18nMixin(LitElement) {
  /**
   * Lit component render function.
   * @return {TemplateResult}
   */
  render() {
    return html`
      <div>${this.translate('translations:notFoundPageContent')}</div>
    `;
  }
}

customElements.define('deep-analyzer-page-not-found', DeepAnalyzerPageNotFound);
