import moment from 'moment';
import { hasReadAllAccess } from './permissions.mjs';

class CollectionService {

    /**
     * Business layer associated with data collection.
     *
     * @param {Object} twitterAPI - RESTDataSource tied to the twitter API.
     * @param {Object} tweetStore - MongoDataSource tied to the tweet collection.
     * @param {Object} logger - Logger to use.
     */
    constructor(twitterAPI, tweetStore, logger) {
        this._twitterAPI = twitterAPI;
        this._tweetStore = tweetStore;
        this._logger = logger;
    }

    /**
     * Begin collection of data related to the specified entity name and type.
     * @param {String} entityName - Name of the economic entity (i.e, 'Google').
     * @param {String} entityType - Type of the economic entity (i.e, 'BUSINESS').
     * @param {Object} permissions - Permissions for the user making the request.
     * @returns {Object}
     */
    async collectEconomicData(entityName, entityType, permissions) {
        if (!entityName || (typeof entityName != 'string')) return { success: false };

        if (!entityType || (typeof entityType != 'string')) return { success: false };

        if (!hasReadAllAccess(permissions)) return { success: false};

        this._logger.debug(`Collecting economic data for name: ${entityName}, type: ${entityType}`);

        const strategy = this._strategy(entityType).bind(this);

        const success = await strategy(entityName);

        return { success };
    }

    /**
     * Get the tweets associated with the specified economic entity name and type.
     * @param {String} economicEntityName - Name of the economic entity (i.e, 'Google').
     * @param {String} economicEntityType - Type of the economic entity (i.e, 'BUSINESS').
     * @param {Object} permissions - Permissions for the user making the request.
     * @returns {Array} - Tweets that are in the database or [].
     */
    async tweets(economicEntityName, economicEntityType, permissions) {

        if (!economicEntityName || (typeof economicEntityName != 'string')) return [];

        if (!economicEntityType || (typeof economicEntityType != 'string')) return [];

        if (!hasReadAllAccess(permissions)) return [];

        this._logger.debug(`Fetching tweets for economic entity name: ${economicEntityName}, type: ${economicEntityType}`);

        return await this._tweetStore.readRecentTweets(economicEntityName, economicEntityType, 10);
    }

    /**
     * Fetch the strategy associated with the economic entity type.
     * @param {String} entityType - Economic entity type (i.e, 'BUSINESS').
     * @param {Function} businessHandler - Handler to use in the case of business type. This is used for testing purposes and should use default if not in tests.
     * @returns {Function} - Stategy for use with the specified entity type.
     */
    _strategy(entityType, businessHandler = this._collectBusinessData) {
        const type = entityType.toLowerCase();
        if (type === 'business') {
            return businessHandler;
        } else {
            throw new Error('The specified economic type was unknown.')
        }
    }

    /**
     * Collect data associated with a business.
     * @param {String} businessName - Name of the business for which data will be collected.
     * @returns {Boolean} - True if the function succeeds, false otherwise.
     */
    async _collectBusinessData(businessName) {

        if (!businessName || (typeof businessName != 'string')) return false;

        this._logger.debug(`Fetching data from the twitter API for business name: ${businessName}.`);
        const data = await this._twitterAPI.tweets(businessName);

        const timestamp = moment().unix();

        this._logger.debug(`Adding tweets to the tweet store for business name: ${businessName}, tweets: ${JSON.stringify(data)}.`);

        return await this._tweetStore.createTweets(timestamp, businessName, 'business', data);
    }
}

export { CollectionService };