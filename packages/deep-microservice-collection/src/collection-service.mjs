import moment from 'moment';
import { hasReadAllAccess } from './permissions.mjs';

class CollectionService {

    /**
     * Business layer associated with data collection.
     *
     * @param {Object} twitterAPI - RESTDataSource tied to the twitter API.
     * @param {Object} tweetStore - MongoDataSource tied to the tweet collection.
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
     * @param {Object} user - The user making the request.
     * @returns {Object}
     */
    async collectEconomicData(entityName, entityType, user, logger = this._logger) {
        if (!entityName || (typeof entityName != 'string')) return { success: false };

        if (!entityType || (typeof entityType != 'string')) return { success: false };

        if (!hasReadAllAccess(user)) return { success: false};

        logger.debug(`Collecting economic data for name: ${entityName}, type: ${entityType}`);

        const strategy = this._strategy(entityType).bind(this);

        const success = await strategy(entityName);

        return { success };
    }

    /**
     * Get the tweets associated with the specified economic entity name and type.
     * @param {String} economicEntityName - Name of the economic entity (i.e, 'Google').
     * @param {String} economicEntityType - Type of the economic entity (i.e, 'BUSINESS').
     * @param {Object} user - User making the request.
     * @param {Object} tweetStore - TweetStore instance. This is included for testing purposes and should use the default if not being used in tests.
     * @returns {Array} - Tweets that are in the database or [].
     */
    async tweets(economicEntityName, economicEntityType, user, tweetStore = this._tweetStore, logger = this._logger) {

        if (!economicEntityName || (typeof economicEntityName != 'string')) return [];

        if (!economicEntityType || (typeof economicEntityType != 'string')) return [];

        if (!hasReadAllAccess(user)) return [];

        logger.debug(`Fetching tweets for economic entity name: ${economicEntityName}, type: ${economicEntityType}`);

        return await tweetStore.readRecentTweets(economicEntityName, economicEntityType, 10);
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
     * @param {Object} twitterAPI - TwitterAPI object. This is for use in tests.
     * @param {Object} tweetStore - TweetStore object. This is for use in tests.
     * @returns {Boolean} - True if the function succeeds, false otherwise.
     */
    async _collectBusinessData(businessName, twitterAPI = this._twitterAPI, tweetStore = this._tweetStore, logger = this._logger) {

        if (!businessName || (typeof businessName != 'string')) return false;

        logger.debug(`Fetching data from the twitter API for business name: ${businessName}.`);
        const data = await twitterAPI.tweets(businessName);

        const timestamp = moment().unix();

        logger.debug(`Adding tweets to the tweet store for business name: ${businessName}, tweets: ${JSON.stringify(data)}.`);
        const success = await tweetStore.createTweets(timestamp, businessName, 'business', data);

        return success;
    }
}

export { CollectionService };