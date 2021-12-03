
import { hasReadAllAccess } from './permissions.mjs';

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

    getSentiment(economicEntityName, economicEntityType, user) {
        if (!economicEntityName || (typeof economicEntityName != 'string')) return [];

        if (!economicEntityType || (typeof economicEntityType != 'string')) return [];

        // if (!hasReadAllAccess(user)) return [];

        return {
            entityName: 'Google',
            sentiments: [{
                timestamp: 1,
                score: -3,
                tweets: [{
                    text: 'Something worth saying here! Angerly!'
                },{
                    text: 'This is much more incredible :-D'
                }]
            },{
                timestamp: 2,
                score: 2,
                tweets: [{
                    text: "They've gotten better so far..."
                }, {
                    text: "I don't know whats happening!!!"
                }, {
                    text: "I had a good time at this place."
                }]
            }]
        };
    }
}

export { EconomyService };