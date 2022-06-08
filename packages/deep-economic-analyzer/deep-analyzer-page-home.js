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
        height: 60vh;
        background-image: url('img/businesses.jpg');
        background-position: center;
        background-size: cover;
        background-repeat: no-repeat;
        background-attachment: fixed;
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

  /**
   * Lit component render function.
   * @return {TemplateResult}
   */
  render() {
    return html`
      <h1 class="headline">${translate('translations:headline')}</h1>
      <div class="parallax"></div>
      <div class="section1">
        Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod
        tempor incididunt ut labore et dolore magna aliqua. Ut ornare lectus sit
        amet est placerat in egestas erat. Risus quis varius quam quisque id.
        Hendrerit dolor magna eget est. Libero id faucibus nisl tincidunt. Purus
        faucibus ornare suspendisse sed nisi lacus sed. Proin libero nunc
        consequat interdum varius sit amet. Senectus et netus et malesuada fames
        ac turpis. Consequat semper viverra nam libero justo. Consequat id porta
        nibh venenatis cras sed felis. Porttitor eget dolor morbi non arcu risus
        quis.
      </div>
    `;
  }
}

customElements.define('deep-analyzer-page-home', DeepAnalyzerPageHome);
