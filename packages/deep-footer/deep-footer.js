import { html, LitElement, css } from 'lit-element';

/* eslint-disable no-unused-vars */
export class DeepFooter extends LitElement {
  static get properties() {
    return {
      companyName: { type: String },
      address: { type: Object },
      routes: { type: Array },
    };
  }

  constructor() {
    super();

    this.companyName = '';
    this.address = {
      streetNumber: '',
      streetName: '',
      cityName: '',
      provinceName: '',
      countryName: '',
      zipCode: '',
    };
    this.routes = [];
  }

  static get styles() {
    return [
      css`
        :host {
          display: grid;
          grid-gap: 0.6rem;
          grid-template-columns: repeat(3, 1fr);
          width: 100%;
          height: minmax(250px, auto);
          background-color: var(--primary-color, #558b2f);
          color: var(--secondary-color, black);
          box-shadow: 0 50vh 0 50vh var(--primary-color, #000000);
        }

        a {
          display: block;
          height: 20px;
          width: 100%;
          margin: 8px;
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
      `,
    ];
  }

  render() {
    return html`
      <div class="helpful-links">
        ${this.routes.map((route) =>
          route.hidden ? html`` : html` <a href="${route.path}">${route.name}</a> `
        )}
      </div>
      <div class="address">
        ${this.address.streetNumber} ${this.address.streetName} <br />
        ${this.address.cityName}, ${this.address.provinceCode} <br />
        ${this.address.countryName} <br />
        ${this.address.zipCode}
      </div>
      <div class="copyright">
        ${this.companyName.length > 0
          ? '\u00A9' + this.companyName + ', ' + new Date().getFullYear()
          : ''}.
      </div>

      <!-- <slot name="helpful-links"></slot>
      <slot name="address"></slot>
      <slot name="copyright"></slot> -->
    `;
  }
}

customElements.define('deep-footer', DeepFooter);
