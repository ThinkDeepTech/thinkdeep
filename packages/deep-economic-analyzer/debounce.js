const debounce = (fcn, wait) => {
  let timeout;

  return function execute(...args) {
    const later = () => {
      clearTimeout(timeout);
      fcn(...args);
    };

    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
};

export {debounce};
