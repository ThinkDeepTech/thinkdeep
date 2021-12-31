import { hasReadAllAccess } from './permissions.mjs';

class ConfigurationService {

    /**
     * Business layer associated with site configuration.
     *
     * @param {Object} logger - Logger to use.
     */
    constructor(logger) {
        this._logger = logger;
    }

    getOrCreateConfiguration(userEmail, permissions) {

        this._logger.info(`Getting or creating site configuration for user: ${userEmail}`);
        return {
            observedEconomicEntities: [{
                name: 'Google',
                type: 'BUSINESS'
            },
            {
                name: 'Tesla',
                type: 'BUSINESS'
            },{
                name: 'PetCo',
                type: 'BUSINESS'
            },{
                name: 'Ford',
                type: 'BUSINESS'
            }, {
                name: 'Amazon',
                type: 'BUSINESS'
            }]
        };
    }

    updateConfiguration(userEmail, observedEconomicEntities, permissions) {
        this._logger.info(`Updating site configuration for user: ${userEmail}`);

        return this.getOrCreateConfiguration();
    }

}

export { ConfigurationService };