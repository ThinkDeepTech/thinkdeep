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
        border-radius: 7px;
        opacity: 0.65;
        text-align: center;
        margin-bottom: 15vh;
      }

      .headline {
        position: absolute;
        opacity: 0.95;
        color: var(--primary-color-dark);
        top: 0;
        left: 0;
        transform: translate(50%, 275%);
        width: 50vw;
        height: 10vh;
        text-align: center;
        z-index: 1;
      }

      @media (max-width: 810px) {
        :host {
          flex-direction: column;
        }

        .features {
          visibility: hidden;
          flex-direction: column;
          align-items: center;
        }

        .feature {
          width: 90vw;
          margin-bottom: 1vh;
          width: 90vw;
        }
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
            <h2>Sentiment Analysis</h2>
            <h4>Coming Soon</h4>
          </div>
          <div class="feature">
            <h2>Structural Analysis</h2>
            <h4>Coming Soon</h4>
          </div>
          <div class="feature">
            <h2>Competition Analysis</h2>
            <h4>Coming Soon</h4>
          </div>
          <div class="feature">
            <h2>Leadership Analysis</h2>
            <h4>Coming Soon</h4>
          </div>
          <div class="feature">
            <h2>Historical Analysis</h2>
            <h4>Coming Soon</h4>
          </div>
          <div class="feature">
            <h2>Industry Analysis</h2>
            <h4>Coming Soon</h4>
          </div>
        </div>
      </div>
    `;
  }
}

customElements.define('deep-analyzer-page-home', DeepAnalyzerPageHome);
