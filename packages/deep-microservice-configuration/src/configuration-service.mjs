import { hasReadAllAccess } from './permissions.mjs';

class ConfigurationService {

    /**
     * Business layer associated with site configuration.
     *
     * @param {Object} logger - Logger to use.
     */
    constructor(configStore, logger) {
        this._configStore = configStore;
        this._logger = logger;
    }

    async getOrCreateConfiguration(userEmail) {

        this._logger.info(`Getting or creating site configuration for user: ${userEmail}`);

        const configExists = await this._configStore.configurationExists(userEmail);

        if (!configExists) {
            await this._configStore.createConfigurationForUser(userEmail, {
                observedEconomicEntities: []
            });
        }

        const configuration = await this._configStore.readConfigurationForUser(userEmail);

        return configuration;
    }

    async updateConfiguration(userEmail, observedEconomicEntities, permissions) {
        this._logger.info(`Updating site configuration for user: ${userEmail}`);

        await this._configStore.updateConfigurationForUser(userEmail, {
            observedEconomicEntities
        });

        return await this._configStore.readConfigurationForUser(userEmail);
    }

}

export { ConfigurationService };