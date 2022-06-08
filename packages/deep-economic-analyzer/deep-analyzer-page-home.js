import {html, css, LitElement} from 'lit';
import {i18nMixin, translate} from 'lit-element-i18n';

/**
 * Lit home page component.
 */
export class DeepAnalyzerPageHome extends i18nMixin(LitElement) {
  /**
   * Lit component style definitions.
   * @return {TemplateResult}
   */
  static get styles() {
    return css`
      :host {
        position: relative;
      }

      .parallax {
        display: flex;
        height: 100vh;
        background-image: linear-gradient(
            rgba(4, 9, 30, 0.6),
            rgba(4, 9, 30, 0.6)
          ),
          url('img/businesses.jpg');
        background-position: center;
        background-size: cover;
        background-repeat: no-repeat;
        background-attachment: fixed;
      }

      .features {
        display: flex;
        align-self: flex-end;
        justify-content: space-evenly;
        height: auto;
        width: 100%;
      }

      .feature {
        color: var(--primary-color-dark);
        background-color: var(--secondary-color);
        width: 12vw;
        height: 150px;
        border-radius: 5px;
        opacity: 0.5;
        text-align: center;
        margin-bottom: 15vh;
      }

      .headline {
        position: absolute;
        opacity: 0.85;
        color: var(--primary-color-dark);
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

  /**
   * Lit component render function.
   * @return {TemplateResult}
   */
  render() {
    return html`
      <h1 class="headline">${translate('translations:headline')}</h1>
      <div class="parallax">
        <div class="features">
          <div class="feature">
            <h2>Sentiment</h2>
            <h4>Progressing</h4>
          </div>
          <div class="feature">
            <h2>Structural</h2>
            <h4>Coming Soon</h4>
          </div>
          <div class="feature">
            <h2>Competition</h2>
            <h4>Coming Soon</h4>
          </div>
          <div class="feature">
            <h2>Leadership</h2>
            <h4>Coming Soon</h4>
          </div>
          <div class="feature">
            <h2>Historical</h2>
            <h4>Coming Soon</h4>
          </div>
          <div class="feature">
            <h2>Assets</h2>
            <h4>Coming Soon</h4>
          </div>
          <div class="feature">
            <h2>Industry</h2>
            <h4>Coming Soon</h4>
          </div>
        </div>
      </div>
    `;
  }
}

customElements.define('deep-analyzer-page-home', DeepAnalyzerPageHome);
