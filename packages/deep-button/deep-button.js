import {html, css, LitElement} from 'lit-element';

export class DeepButton extends LitElement {
  static get properties() {
    return {
      /** Vaadin route */
      route: {type: Object},
    };
  }
  constructor() {
    super();

    this.route = {};
  }

  static get styles() {
    return css`
      button {
        border-radius: 1vw;
        height: inherit;
        width: inherit;
        background-color: var(--secondary-color, #39c16c);
        color: var(--primary-color, black);
        font-weight: bold;
      }
    `;
  }

  async firstUpdated() {
    // Give the browser a chance to paint
    await new Promise((r) => setTimeout(r, 0));
    this.addEventListener('click', this._handleClick);
  }

  render() {
    return html` <button type="button"><slot></slot></button>`;
  }

  /**
   * Handle the button click.
   */
  _handleClick() {
    const button = this.shadowRoot.querySelector('button');
    button.click();
  }
}
customElements.define('deep-button', DeepButton);
