import {Command} from './command/command.mjs';
import moment from 'moment';
import { hasReadAllAccess } from './permissions.mjs';

/**
 * Time interval between each twitter API call.
 *
 * NOTE: Due to twitter developer account limitations only 500,000 tweets can be consumed per month.
 * As a result, ~400 businesses can be watched if fetched every 6 hours resulting in the following math.
 */
const TWITTER_FETCH_INTERVAL = 6 * 60 * 60 * 1000; /** 6 hrs -> min -> seconds -> ms */

const automationPerms = { scope: 'read:all' };

class CollectionService {

    /**
     * Business layer associated with data collection.
     *
     * @param {Object} twitterAPI - RESTDataSource tied to the twitter API.
     * @param {Object} tweetStore - MongoDataSource tied to the tweet collection.
     * @param {Object} economicEntityMemo - EconomicEntityMemo object to be used.
     * @param {Object} logger - Logger to use.
     */
    constructor(twitterAPI, tweetStore, economicEntityMemo, logger) {
        this._twitterAPI = twitterAPI;
        this._tweetStore = tweetStore;
        this._economicEntityMemo = economicEntityMemo;
        this._logger = logger;

        this._economicEntityMemo.readAll().then((economicEntities) => {
            for (const economicEntity of economicEntities) {
                this.collectEconomicData(economicEntity.economicEntityName, economicEntity.economicEntityType, automationPerms, true);
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
    async collectEconomicData(entityName, entityType, permissions, automated = false) {
        if (!entityName || (typeof entityName != 'string')) return { success: false };

        if (!entityType || (typeof entityType != 'string')) return { success: false };

        if (!hasReadAllAccess(permissions)) return { success: false};

        this._logger.debug(`Collecting economic data for name: ${entityName}, type: ${entityType}`);

        const collectingData = await this._economicEntityMemo.collectingData(entityName, entityType);

        if (!collectingData || automated) {

            const commands = this._commands(entityName, entityType);

            for (const command of commands) {
                command.execute();
            }

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

        if (!economicEntityName || (typeof economicEntityName != 'string')) return [];

        if (!economicEntityType || (typeof economicEntityType != 'string')) return [];

        if (!hasReadAllAccess(permissions)) return [];

        this._logger.debug(`Fetching tweets for economic entity name ${economicEntityName}, type ${economicEntityType}`);

        // TODO: Return more than 10
        return await this._tweetStore.readRecentTweets(economicEntityName, economicEntityType, 10);
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
     * Collect data associated with a business.
     * @param {String} entityName - Economic entity name (i.e, 'Google').
     * @param {String} entityType - Economic entity type (i.e, 'BUSINESS').
     * @returns {Boolean} - True if the function succeeds, false otherwise.
     */
    async _collectTweets(entityName, entityType) {

        if (!entityName || (typeof entityName != 'string')) return false;

        if (!entityType || (typeof entityType != 'string')) return false;

        this._logger.debug(`Fetching data from the twitter API for: name ${entityName}, type ${entityType}.`);
        const data = await this._twitterAPI.tweets(entityName);

        const timestamp = moment().unix();

        this._logger.debug(`Adding tweets to the tweet store for: name ${entityName}, type ${entityType}, tweets ${JSON.stringify(data)}.`);

        return await this._tweetStore.createTweets(timestamp, entityName, entityType, data);
    }
}

export { CollectionService };