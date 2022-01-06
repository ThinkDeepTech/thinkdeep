import {Command} from './command.mjs';
import { validString } from './helpers.mjs';
import moment from 'moment';
import { hasReadAllAccess } from './permissions.mjs';

/**
 * Time interval between each twitter API call.
 *
 * NOTE: Due to twitter developer account limitations only 500,000 tweets can be consumed per month.
 * As a result, ~16000 businesses can be watched.
 */
const TWITTER_FETCH_INTERVAL = 6 * 60 * 60 * 1000; /** hrs * min * seconds * ms */

class CollectionService {

    /**
     * Business layer associated with data collection.
     *
     * @param {Object} twitterAPI - RESTDataSource tied to the twitter API.
     * @param {Object} tweetStore - MongoDataSource tied to the tweet collection.
     * @param {Object} economicEntityMemo - EconomicEntityMemo object to be used.
     * @param {Object} commander - Commander object to be used.
     * @param {Object} logger - Logger to use.
     */
    constructor(twitterAPI, tweetStore, economicEntityMemo, commander, logger) {
        this._twitterAPI = twitterAPI;
        this._tweetStore = tweetStore;
        this._economicEntityMemo = economicEntityMemo;
        this._commander = commander;
        this._logger = logger;

        this._economicEntityMemo.readEconomicEntities().then((economicEntities) => {
            for (const economicEntity of economicEntities) {
                this._startDataCollection(economicEntity.name, economicEntity.type);
            }
        }, (reason) => {
            this._logger.error(`Failed to read memoized economic entities. Reason: ${JSON.stringify(reason)}`);
        });
    }

    /**
     * Begin data collection related to the specified entity name and type.
     * @param {String} entityName - Name of the economic entity (i.e, 'Google').
     * @param {String} entityType - Type of the economic entity (i.e, 'BUSINESS').
     * @param {Object} permissions - Permissions for the user making the request.
     * @returns {Object}
     */
    async collectEconomicData(entityName, entityType, permissions) {

        if (!validString(entityName)) return { success: false };

        if (!validString(entityType)) return { success: false };

        if (!hasReadAllAccess(permissions)) return { success: false};

        this._logger.debug(`Collecting economic data for name: ${entityName}, type: ${entityType}`);

        const collectingData = await this._economicEntityMemo.collectingData(entityName, entityType);

        if (!collectingData) {

            this._startDataCollection(entityName, entityType);

            await this._economicEntityMemo.memoizeDataCollection(entityName, entityType);
        }

        return { success: true };
    }

    /**
     * Get the tweets associated with the specified economic entity name and type.
     * @param {String} economicEntityName - Name of the economic entity (i.e, 'Google').
     * @param {String} economicEntityType - Type of the economic entity (i.e, 'BUSINESS').
     * @param {Object} permissions - Permissions for the user making the request.
     * @returns {Array} - Tweets that are in the database or [].
     */
    async tweets(economicEntityName, economicEntityType, permissions) {

        if (!validString(economicEntityName)) return [];

        if (!validString(economicEntityType)) return [];

        if (!hasReadAllAccess(permissions)) return [];

        this._logger.debug(`Fetching tweets for economic entity name ${economicEntityName}, type ${economicEntityType}`);

        // TODO: Return more than 10
        return this._tweetStore.readRecentTweets(economicEntityName, economicEntityType, 10);
    }

    /**
     * Start data collection for the specified entity name and type.
     * @param {String} entityName - Name of the economic entity (i.e, 'Google')
     * @param {String} entityType - Type of the economic entity (i.e, 'BUSINESS')
     * @returns
     */
    _startDataCollection(entityName, entityType) {

        if (!validString(entityName)) return;

        if (!validString(entityType)) return;

        const commands = this._commands(entityName, entityType);

        this._commander.execute(`${entityName}:${entityType}`, commands);
    }

    /**
     * Fetch the commands associated with the economic entity type.
     * @param {String} entityName - Name of the economic entity (i.e, 'Google').
     * @param {String} entityType - Economic entity type (i.e, 'BUSINESS').
     * @returns {Array} - Array of command objects to execute for data collection.
     */
    _commands(entityName, entityType) {
        const type = entityType.toLowerCase();
        if (type === 'business') {
            const command = new Command(TWITTER_FETCH_INTERVAL, this._collectTweets.bind(this, entityName, entityType));
            return [command];
        } else {
            throw new Error('The specified economic type was unknown.')
        }
    }

    /**
     * Collect tweets for a given entity name and type.
     * @param {String} entityName - Economic entity name (i.e, 'Google').
     * @param {String} entityType - Economic entity type (i.e, 'BUSINESS').
     * @returns {Boolean} - True if the function succeeds, false otherwise.
     */
    async _collectTweets(entityName, entityType) {

        if (!validString(entityName)) return false;

        if (!validString(entityType)) return false;

        this._logger.debug(`Fetching data from the twitter API for: name ${entityName}, type ${entityType}.`);
        const data = await this._twitterAPI.tweets(entityName);

        const timestamp = moment().unix();

        this._logger.debug(`Adding tweets to the tweet store for: name ${entityName}, type ${entityType}, tweets ${JSON.stringify(data)}.`);

        return this._tweetStore.createTweets(timestamp, entityName, entityType, data);
    }
}

export { CollectionService };