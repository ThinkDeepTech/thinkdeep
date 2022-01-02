import { hasReadAllAccess, isCurrentUser } from './permissions.mjs';

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

    async getOrCreateConfiguration(userEmail, permissions, me) {

        if (!userEmail || (typeof userEmail != 'string')) return { observedEconomicEntities: [ ]};

        if (!isCurrentUser(userEmail, me) || !hasReadAllAccess(permissions)) return { observedEconomicEntities: [ ]};

        this._logger.debug(`Getting or creating site configuration for user: ${userEmail}`);

        const configExists = await this._configStore.configurationExists(userEmail);

        if (!configExists) {
            await this._configStore.createConfigurationForUser(userEmail, {
                observedEconomicEntities: []
            });
        }

        return this._configStore.readConfigurationForUser(userEmail);
    }

    async updateConfiguration(userEmail, observedEconomicEntities, permissions, me) {

        if (!userEmail || (typeof userEmail != 'string')) return { observedEconomicEntities: [ ]};

        if (!isCurrentUser(userEmail, me) || !hasReadAllAccess(permissions)) return { observedEconomicEntities: [ ]};

        if (!Array.isArray(observedEconomicEntities)) return this._configStore.readConfigurationForUser(userEmail);

        this._logger.debug(`Updating site configuration for user: ${userEmail}`);

        await this._configStore.updateConfigurationForUser(userEmail, {
            observedEconomicEntities
        });

        return this._configStore.readConfigurationForUser(userEmail);
    }

}

export { ConfigurationService };