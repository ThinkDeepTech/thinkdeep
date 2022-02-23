import { K8sCronJob } from './command/k8s-cron-job.mjs';
import { validString } from './helpers.mjs';
import moment from 'moment';
import { hasReadAllAccess } from './permissions.mjs';

class CollectionService {

    /**
     * Business layer associated with data collection.
     *
     * @param {Object} tweetStore - MongoDataSource tied to the tweet collection.
     * @param {Object} economicEntityMemo - EconomicEntityMemo object to be used.
     * @param {Object} commander - Commander object to be used.
     * @param {Object} admin - KafkaJS admin.
     * @param {Object} producer - KafkaJS producer to use.
     * @param {Object} consumer - KafkaJS consumer to use.
     * @param {Object} k8s - Kubernetes Javascript Client import.
     * @param {Object} logger - Logger to use.
     */
    constructor(tweetStore, economicEntityMemo, commander, admin, producer, consumer, k8s, logger) {
        this._tweetStore = tweetStore;
        this._economicEntityMemo = economicEntityMemo;
        this._commander = commander;
        this._admin = admin;
        this._producer = producer;
        this._consumer = consumer;
        this._k8s = k8s;
        this._logger = logger;

        this._topicCreation([{topic: 'TWEETS_COLLECTED', replicationFactor: 1}, { topic: 'TWEETS_FETCHED', replicationFactor: 1}]).then(async() => {

            const economicEntities = await this._economicEntityMemo.readEconomicEntities();
            for (const economicEntity of economicEntities) {
                this._startDataCollection(economicEntity.name, economicEntity.type);
            }

            await this._consumer.subscribe({ topic: 'TWEETS_FETCHED', fromBeginning: true });

            await this._consumer.run({
                eachMessage: async ({message}) => {

                    this._logger.debug(`Received kafka message: ${message.value.toString()}`);

                    const { economicEntityName, economicEntityType, tweets} = JSON.parse(message.value.toString());
                    await this._handleTweetsFetched(economicEntityName, economicEntityType, tweets);
                }
            });

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

            const kababCaseName = entityName.toLowerCase().split(' ').join('-');
            const kababCaseType = entityType.toLowerCase().split(' ').join('-');
            const cronName = `fetch-tweets-${kababCaseName}-${kababCaseType}`;
            const command = new K8sCronJob({
                name: cronName,
                namespace: 'default',
                 /**
                 * Time interval between each twitter API call.
                 *
                 * NOTE: Due to twitter developer account limitations only 500,000 tweets can be consumed per month.
                 * As a result, ~400 businesses can be watched when fetched every 6 hours.
                 */
                 /** min | hour | day | month | weekday */
                // schedule: `0 6 * * *`,
                schedule: `* * * * *`,
                image: 'thinkdeeptech/collect-data:latest',
                command: 'node',
                args: ['src/collect-data.mjs', `--entity-name=${entityName}`, `--entity-type=${entityType}`, '--operation-type=fetch-tweets']
            }, this._k8s, this._logger);

            return [command];
        } else {
            throw new Error('The specified economic type was unknown.')
        }
    }

    /**
     * Handle the tweets fetched event.
     * @param {String} entityName - Economic entity name (i.e, 'Google').
     * @param {String} entityType - Economic entity type (i.e, 'BUSINESS').
     * @param {Array} tweets - Array of tweet objects of the form { text: '...' }.
     * @returns {Boolean} - True if the function succeeds, false otherwise.
     */
    async _handleTweetsFetched(entityName, entityType, tweets) {

        if (!validString(entityName)) return false;

        if (!validString(entityType)) return false;

        if (!Array.isArray(tweets) || (tweets.length === 0)) return false;

        const timestamp = moment().unix();

        this._logger.info(`Adding timeseries entry to tweet store with timestamp ${timestamp}, tweets ${JSON.stringify(tweets)}`);
        const tweetsCreated = await this._tweetStore.createTweets(timestamp, entityName, entityType, tweets);

        const timeSeriesItems = await this._tweetStore.readRecentTweets(entityName, entityType, 10);

        const event = {
            economicEntityName: entityName,
            economicEntityType: entityType,
            timeSeriesItems
        };

        this._logger.info(`Adding collection event with value: ${JSON.stringify(event)}`);

        await this._producer.send({
            topic: 'TWEETS_COLLECTED',
            messages: [
                { value: JSON.stringify(event) }
            ]
        });

        return tweetsCreated;
    }

    /**
     * Create the specified topics.
     *
     * @param {Array} topics - String array consisting of topic names.
     */
    async _topicCreation(topics) {
        try {
            await this._admin.createTopics({
                /**
                 * NOTE: If you don't wait for leaders the system throws an error when trying to write to the topic if a leader
                 * hasn't been selected.
                 */
                waitForLeaders: true,
                topics
            });
        } catch (error) {
            /** An error is thrown when the topic has already been created */
            this._logger.warn(`Creation of topics ${JSON.stringify(topics)} exited with error: ${JSON.stringify(error)}, message: message: ${error.message.toString()}`);
        }
    }
}

export { CollectionService };