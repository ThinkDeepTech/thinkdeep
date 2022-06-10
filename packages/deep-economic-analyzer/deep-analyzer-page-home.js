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
        display: block;
        position: relative;
      }

      .grid {
        display: grid;
        grid-template-rows: repeat(7, 1fr);
        grid-template-areas:
          '.'
          '.'
          'slogan'
          '.'
          '.'
          'features'
          '.';
        height: 95vh;
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

      .slogan {
        grid-area: slogan;
        text-align: center;
        opacity: 0.9;
        color: var(--primary-color-dark);
      }

      .features {
        grid-area: features;
        display: flex;
        align-self: flex-end;
        justify-content: space-evenly;
        height: auto;
        width: 100%;
      }

      .feature {
        transition: box-shadow 0.3s;
        color: var(--primary-color-dark);
        background-color: var(--secondary-color);
        width: 12vw;
        height: 150px;
        border-radius: 7px;
        opacity: 0.65;
        text-align: center;
        margin-bottom: 8vh;
      }

      .feature:hover {
        box-shadow: 0 0 8px var(--primary-color-dark);
      }

      @media (max-width: 810px) {
        .slogan {
          padding-top: 80px;
          padding-bottom: 60px;
        }

        .features {
          flex-direction: column;
          align-items: center;
        }

        .feature {
          width: 90vw;
          height: 13vh;
          margin-bottom: 5px;
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
      <div class="grid">
        <h1 class="slogan">${translate('translations:headline')}</h1>
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
