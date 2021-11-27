
import { hasReadAllAccess } from './permissions.mjs';
import { PostgresDataSource } from './datasource/postgres-datasource.mjs';

/**
 * Represents a querable model of the economy.
 */
class EconomyService {

    constructor(dataSource) {
        this._dataSource = dataSource;
    }

    /**
     *  Get the business relationships associated with the named business.
     * @param {String} businessName
     * @param {Object} user
     * @return {Array} The desired business relationships in array form or []
     */
    getBusinessRelationships(businessName, user) {
        if (!businessName || (typeof businessName != 'string')) return [];

        if (!hasReadAllAccess(user)) return [];

        return this._dataSource.getBusinessGraph(businessName);
    }
}

export { EconomyService };