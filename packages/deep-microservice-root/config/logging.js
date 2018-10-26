const development = {
  appenders: ['out', 'app']
};

export default {
  appenders: {
    out: {
      type: 'stdout'
    },
    app: {
      type: 'file',
      filename: 'application.log'
    }
  },
  categories: {
    default: development,
    development
  }
};
