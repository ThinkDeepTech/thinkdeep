import {hasReadAllAccess, isCurrentUser} from './permissions.js';

/**
 * Service providing application configurability.
 */
class ConfigurationService {
  /**
   * Business layer associated with site configuration.
   *
   * @param {Object} configStore - Configuration store to use.
   * @param {Object} logger - Logger to use.
   */
  constructor(configStore, logger) {
    this._configStore = configStore;
    this._logger = logger;
  }

  /**
   * Get or create a user configuration.
   *
   * @param {String} userEmail - Email for the user for whom a configuration is being fetched.
   * @param {Object} permissions - Permissions object containing the scope for user auth.
   * @param {Object} me - The object containing the current user making the request.
   * @return {Object} - The configuration associated with the user or a default of the form { observedEconomicEntities: []}.
   */
  async getOrCreateConfiguration(userEmail, permissions, me) {
    if (!userEmail || typeof userEmail !== 'string')
      return {observedEconomicEntities: []};

    if (!isCurrentUser(userEmail, me) || !hasReadAllAccess(permissions))
      return {observedEconomicEntities: []};

    this._logger.debug(
      `Getting or creating site configuration for user: ${userEmail}`
    );

    const configExists = await this._configStore.configurationExists(userEmail);

    if (!configExists) {
      await this._configStore.createConfigurationForUser(userEmail, {
        observedEconomicEntities: [],
      });
    }

    return this._configStore.readConfigurationForUser(userEmail);
  }

  /**
   * Update a configuration.
   * @param {String} userEmail - Email for the user for whom a configuration is being fetched.
   * @param {Array} observedEconomicEntities - Array of new observed economic entities to associate with the user.
   * @param {Object} permissions - Permissions object containing the scope for user auth.
   * @param {Object} me - The object containing the current user making the request.
   * @return {Object} - The configuration associated with the user or a default of the form { observedEconomicEntities: []}.
   */
  async updateConfiguration(
    userEmail,
    observedEconomicEntities,
    permissions,
    me
  ) {
    if (!userEmail || typeof userEmail !== 'string')
      return {observedEconomicEntities: []};

    if (!isCurrentUser(userEmail, me) || !hasReadAllAccess(permissions))
      return {observedEconomicEntities: []};

    if (!Array.isArray(observedEconomicEntities))
      return this._configStore.readConfigurationForUser(userEmail);

    this._logger.debug(`Updating site configuration for user: ${userEmail}`);

    await this._configStore.updateConfigurationForUser(userEmail, {
      observedEconomicEntities,
    });

    return this._configStore.readConfigurationForUser(userEmail);
  }
}

export {ConfigurationService};
