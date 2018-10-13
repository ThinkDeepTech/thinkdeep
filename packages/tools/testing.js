import { render, TemplateResult } from 'lit-html';

/**
 * Stamps the template into the DOM.
 * @param {TemplateResult} fixture - LitElement TemplateResult containing DOM
 * representing the test fixture markup.
 * @returns {Object|null} - DOM node after component has been stamped into document or null;
 */
export const stamp = async fixture => {
  if (!(fixture instanceof TemplateResult)) {
    throw new TypeError('A fixture must be a TemplateResult');
  }
  const div = document.createElement('div');
  render(fixture, div);
  const component = div.firstElementChild;
  document.body.appendChild(component);
  await component.updateComplete;
  return component || null;
};

/**
 * Remove the component from its parent. This is used to avoid memory leaks when
 * fixtures are stamped.
 * @param {HTMLElement} component - Component to be removed.
 */
export const remove = component => {
  if (component.parentNode) component.parentNode.removeChild(component);
};
