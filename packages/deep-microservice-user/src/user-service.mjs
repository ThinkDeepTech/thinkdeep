import { hasReadAllAccess } from './permissions.mjs';

class UserService {

    /**
     * Business layer associated with users.
     *
     * @param {Object} logger - Logger to use.
     */
    constructor(logger) {
        this._logger = logger;
    }

    getOrCreateUser(permissions) {

        this._logger.debug('Getting or creating user.');
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

    updateUser(observedEconomicEntities, permissions) {
        this._logger.debug('Updating user.');

        return this.getOrCreateUser();
    }

}

export { UserService };