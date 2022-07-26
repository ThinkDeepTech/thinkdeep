/**
 * Get collect data textfield.
 * @param {HTMLElement} element Ancestor element.
 * @return {HTMLElement} The html element.
 */
const collectDataInput = (element) => {
  return element.shadowRoot.querySelector('mwc-textfield');
};

/**
 * Get collect data button.
 * @param {HTMLElement} element Ancestor element.
 * @return {HTMLElement} The html element.
 */
const collectDataButton = (element) => {
  return element.shadowRoot.querySelector('mwc-button');
};

/**
 * Get the specified analysis dropdown option element.
 * @param {Element} element Parent element of the drop down.
 * @param {String} value Dropdown option value.
 * @return {Element} Element with a matching value.
 */
const analysisDropdownOption = (element, value) => {
  const analysisOptions = analysisDropdownOptions(element);

  let target = null;
  for (const option of analysisOptions) {
    if (option.value === value) {
      target = option;
    }
  }

  if (!target) {
    throw new Error(
      `Failed to find analysis dropdown target with value: ${value}`
    );
  }

  return target;
};

/**
 * Get all analysis dropdown options.
 * @param {Element} element
 * @return {Array<Element>} Dropdown items.
 */
const analysisDropdownOptions = (element) => {
  return element.shadowRoot.querySelectorAll('mwc-select > mwc-list-item');
};

/**
 * Get the selected analysis dropdown option.
 * @param {Element} element
 * @return {Element} Selected option.
 */
const selectedAnalysisDropdownOption = (element) => {
  const dropdownOptions = analysisDropdownOptions(element);

  let target = null;
  for (const option of dropdownOptions) {
    if (option.ariaSelected) {
      target = option;
    }
  }

  if (!target) {
    throw new Error(`The selected drop down option wasn't found.`);
  }

  return target;
};

/**
 * Get unselected analysis dropdown options.
 * @param {Element} element
 * @return {Array<Element>} Dropdown items that are not selected.
 */
const unselectedAnalysisDropdownOptions = (element) => {
  const dropdownOptions = analysisDropdownOptions(element);

  const unselectedOptions = [];
  for (const dropdownOption of dropdownOptions) {
    if (!selected(dropdownOption)) {
      unselectedOptions.push(dropdownOption);
    }
  }

  return unselectedOptions;
};

/**
 * Get sentiment chart.
 * @param {HTMLElement} element Ancestor element.
 * @return {HTMLElement} The html element.
 */
const sentimentChart = (element) => {
  return element.shadowRoot.querySelector('google-chart');
};

/**
 * Get the start date element.
 * @param {Element} element
 * @return {Element} The element.
 */
const startDate = (element) => {
  return element.shadowRoot.querySelector('#start-date');
};

/**
 * Get the end date element.
 * @param {Element} element
 * @return {Element} The element.
 */
const endDate = (element) => {
  return element.shadowRoot.querySelector('#end-date');
};

/**
 * Get the date picker overlay.
 * @return {Element} Date picker overlay.
 */
const datePickerOverlay = () => {
  return document.documentElement.querySelector('vaadin-date-picker-overlay');
};

/**
 * Get all the date options from the overlay.
 * @param {Element} overlayElement
 * @return {NodeListOf<Element>} Date options from overlay.
 */
const dateOptions = (overlayElement) => {
  const overlayContentDiv = overlayElement.shadowRoot.querySelector('#content');
  const vaadinOverlayContent =
    overlayContentDiv.shadowRoot.querySelector('#overlay-content');
  const monthScroller =
    vaadinOverlayContent.shadowRoot.querySelector('#monthScroller');
  const monthCalendar = monthScroller.querySelector(
    '[part="month"]:not([aria-hidden="true"])'
  );

  return monthCalendar.shadowRoot.querySelectorAll('td:not([aria-label=""])');
};

/**
 * Get the unselected date options from the overlay.
 * @param {Element} overlayElement
 * @return {Array<Element>} Unselected date options.
 */
const unselectedDateOptions = (overlayElement) => {
  const unselectedOptions = [];

  for (const option of dateOptions(overlayElement)) {
    if (!selected(option)) {
      unselectedOptions.push(option);
    }
  }

  return unselectedOptions;
};

/**
 * Determine if the element is selected.
 * @param {Element} element
 * @return {Boolean} True if selected. False otherwise.
 */
const selected = (element) => {
  return element.matches('[aria-selected="true"]');
};

// /**
//  * Select a point on the specified chart.
//  *
//  * @param {Element} targetChart Chart element on which selection will occur.
//  * @param {Array<Number>} point Array of size two of the form [x, y].
//  */
// const selectChartValue = async (targetChart, point) => {
//   const selections = [];

//   for (let i = 0; i < targetChart.rows.length; i++) {
//     const prospectivePoint = targetChart.rows[i];
//     if (point[0] === prospectivePoint[0] && point[1] === prospectivePoint[1]) {
//       selections.push({row: i, column: 0});
//     }
//   }

//   targetChart.selection = selections;

//   // NOTE: Keep this synced with google chart to ensure correctness.
//   targetChart.dispatchEvent(
//     new CustomEvent(`google-chart-select`, {
//       bubbles: true,
//       composed: true,
//       detail: {
//         // Events fire after `chartWrapper` is initialized.
//         chart: targetChart,
//       },
//     })
//   );

//   await delayForPageRender();
// };

export {
  collectDataButton,
  collectDataInput,
  sentimentChart,
  analysisDropdownOption,
  analysisDropdownOptions,
  unselectedAnalysisDropdownOptions,
  selectedAnalysisDropdownOption,
  startDate,
  endDate,
  unselectedDateOptions,
  datePickerOverlay,
};
