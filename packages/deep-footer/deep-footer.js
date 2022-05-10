/* eslint-disable no-unused-vars */

import {html, LitElement, css} from 'lit';

/**
 * Component providing footer for web page.
 */
export class DeepFooter extends LitElement {

  /**
   * Property definitions for lit component.
   */
  static get properties() {
    return {
      companyName: {type: String},
      address: {type: Object},
      routes: {type: Array},
    };
  }

  /**
   * Initialization for lit component.
   */
  constructor() {
    super();

    this.companyName = '';
    this.address = {};
    this.routes = [];
  }

  /**
   * Styles for lit component.
   */
  static get styles() {
    return [
      css`
        :host {
          display: grid;
          grid-gap: 0.6rem;
          grid-template-columns: repeat(3, 1fr);
          width: 100%;
          height: minmax(250px, auto);
          background-color: var(--primary-color, #757575);
          color: var(--secondary-color, black);
          box-shadow: 0 50vh 0 50vh var(--primary-color, #757575);
        }

        a {
          display: block;
          height: 20px;
          width: 100%;
          margin: 1vh;
          padding-top: 2vh;
          color: var(--secondary-color, #000000);
        }

        a:link {
          text-decoration: none;
        }

        a:visited {
          text-decoration: none;
          color: var(--secondary-color-dark, #000000);
        }

        a:hover {
          text-decoration: none;
          color: var(--secondary-color-light, #000000);
        }

        a:active {
          text-decoration: none;
        }

        a[hidden] {
          visibility: hidden;
        }

        .address,
        .copyright {
          margin: 3vh;
          text-align: center;
        }

        .helpful-links {
          margin-left: 4vw;
        }
      `,
    ];
  }

  /**
   * Lit render function.
   * @return {TemplateResult}
   */
  render() {
    return html`
      <div class="helpful-links">
        ${this.routes.map((route) =>
          route.hidden
            ? html``
            : html` <a href="${route.path}">${route.name}</a> `
        )}
      </div>
      <div class="address">
        ${Object.keys(this.address).length !== 0
          ? html` ${this.address.streetNumber} ${this.address.streetName} <br />
              ${this.address.cityName}, ${this.address.provinceCode} <br />
              ${this.address.countryName} <br />
              ${this.address.zipCode}`
          : html``}
      </div>
      <div class="copyright">${this._copyright(this.companyName)}.</div>
    `;
  }

  /**
   * Get copyright.
   *
   * Company name will be incoporated in a copyright string.
   *
   * @param {String} companyName - Name of the company.
   * @return {String} - The copyright or ''.
   */
  _copyright(companyName) {
    return this.companyName.length > 0
      ? '\u00A9' + this.companyName + ', ' + new Date().getFullYear()
      : '';
  }
}

customElements.define('deep-footer', DeepFooter);
