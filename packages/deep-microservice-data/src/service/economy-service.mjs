
import { PostgresDataSource } from '../datasource/postgres-datasource.mjs';

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
     */
    getBusinessRelationships(businessName) {
        if (!businessName || (typeof businessName != 'string')) return [];

        const relationships = this._dataSource.getBusinessGraph(businessName);

        return relationships;
    }
}

export { EconomyService };