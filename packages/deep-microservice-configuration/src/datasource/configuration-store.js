import {MongoDataSource} from 'apollo-datasource-mongodb';
import {
  EconomicEntityFactory,
  objectifyEconomicEntities,
  validEconomicEntities,
} from '@thinkdeep/model';

/**
 * Check whether the provided email is valid.
 * @param {String} userEmail - Email to check.
 * @return {Boolean} - True if email is valid. False otherwise.
 */
const validEmail = (userEmail) => {
  return !!userEmail && typeof userEmail === 'string';
};

/**
 * Check whether the provided configuration is valid.
 * @param {Object} configuration - The target being checked.
 * @return {Boolean} - True if the configuration is valid. False otherwise.
 */
const validConfiguration = (configuration) => {
  return (
    !!configuration &&
    typeof configuration === 'object' &&
    Object.keys(configuration).length > 0 &&
    !!configuration?.observedEconomicEntities &&
    !!Array.isArray(configuration?.observedEconomicEntities) &&
    validEconomicEntities(configuration?.observedEconomicEntities)
  );
};

/**
 * Repository object used with configurations.
 */
class ConfigurationStore extends MongoDataSource {
  /**
   * Check if a configuration exists for the specified user.
   * @param {String} userEmail - target user.
   * @return {Boolean} - True if the configuration exists. False otherwise.
   */
  async configurationExists(userEmail) {
    if (!validEmail(userEmail))
      throw new Error(
        `Determination of an existant configuration requires a valid email. Received: ${userEmail}`
      );

    const configuration = await this.readConfigurationForUser(userEmail);
    return validConfiguration(configuration);
  }

  /**
   * Create a configuration for the specified user.
   * @param {String} userEmail - User for whom a configuration will be created.
   * @param {Object} configuration - The configuration to create.
   */
  async createConfigurationForUser(userEmail, configuration) {
    if (!validEmail(userEmail))
      throw new Error(
        `Creating a configuration requires a valid email. Received: ${userEmail}`
      );

    if (!validConfiguration(configuration))
      throw new Error(
        `Creating a configuration requires a valid configuration. Received: ${JSON.stringify(
          configuration
        )}`
      );

    try {
      await this.collection.insertOne({
        userEmail,
        ...configuration,
        observedEconomicEntities: objectifyEconomicEntities(
          configuration.observedEconomicEntities
        ),
      });
    } catch (e) {
      throw new Error(`Configuration insertion failed: ${e.message}`);
    }
  }

  /**
   * Read the configuration associated with the specified user.
   * @param {String} userEmail - Target user.
   * @return {Object} - The configuration.
   */
  async readConfigurationForUser(userEmail) {
    if (!validEmail(userEmail))
      throw new Error(
        `Reading a configuration requires a valid email. Received: ${userEmail}`
      );

    try {
      const configurations = await this.collection
        .find({userEmail})
        .limit(1)
        .toArray();
      return this._reduceConfigurations(configurations)[0];
    } catch (e) {
      throw new Error(`Configuration read failed: ${e.message}`);
    }
  }

  /**
   * Update the configuration associated with the specified user.
   * @param {String} userEmail - Target user.
   * @param {Object} configuration - Configuration to apply.
   */
  async updateConfigurationForUser(userEmail, configuration) {
    if (!validEmail(userEmail))
      throw new Error(
        `Updating a configuration requires a valid email. Received: ${userEmail}`
      );

    if (!validConfiguration(configuration))
      throw new Error(
        `Updating a configuration requires a valid configuration. Received: ${JSON.stringify(
          configuration
        )}`
      );

    try {
      await this.collection.updateOne(
        {userEmail},
        {
          $set: {
            observedEconomicEntities: objectifyEconomicEntities(
              configuration.observedEconomicEntities
            ),
          },
        }
      );
    } catch (e) {
      throw new Error(`Configuration update failed: ${e.message}`);
    }
  }

  /**
   * Reduce the configuration.
   * @param {Array<Object>} configurations
   * @return {Array<Object>} Reduced configurations.
   */
  _reduceConfigurations(configurations) {
    const results = [];
    for (const configuration of configurations) {
      if (!Array.isArray(configuration?.observedEconomicEntities)) continue;

      results.push({
        ...configuration,
        observedEconomicEntities: EconomicEntityFactory.get(
          configuration.observedEconomicEntities
        ),
      });
    }

    return results;
  }
}

export {ConfigurationStore};
