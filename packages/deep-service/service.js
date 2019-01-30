'use-strict';

// import Koa from 'koa';
// import {
//     ApolloServer,
//     gql
// } from 'apollo-server-koa';

export default class Service {
  /**
   * Configures the service as desired.
   * @param {String} options.name - Hostname or IP.
   * @param {Number} options.port - Port on which service will run.
   */
  constructor(
    options = {
      name: '127.0.0.1',
      port: 3000
    }
  ) {
    if (!this.validServiceConfiguration(options))
      throw new Error(`The service configurations are invalid. Fix them and restart the service.`);
    this.name = options.name;
    this.port = options.port;
  }

  /**
   * Determine if the service options are valid.
   * @param {Object} options - Service configurations.
   * @returns {Boolean} - True if configurations are valid. False otherwise.
   */
  validServiceConfiguration(options) {
    // TODO: Implement more complex logic to give users direct feedback indicating which
    // configurations were invalid.
    return options && options.name && options.name.length && options.port;
  }
}
