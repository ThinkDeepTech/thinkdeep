import {attachExitHandler} from '@thinkdeep/attach-exit-handler';
import moment from 'moment';
import { hasReadAllAccess } from './permissions.mjs';

class AnalysisService {

    /**
     * Business layer for analysis operations.
     *
     * NOTE: The parameters below are injected because that improves testability of the codebase.
     *
     * @param {Object} analysisDataStore - AnalysisDataStore to use when interacting with the database.
     * @param {Object} sentimentLib - Library to use for sentiment analysis. This is an instance of Sentiment from 'sentiment' package.
     * @param {Object} logger - Logger to use.
     */
    constructor(analysisDataStore, sentimentLib, kafkaClient, logger) {
        this._analysisDataStore = analysisDataStore;
        this._sentimentLib = sentimentLib;
        this._kafkaClient = kafkaClient;

        this._admin = this._kafkaClient.admin();
        this._consumer = this._kafkaClient.consumer({ groupId: 'deep-microservice-analysis-consumer' });
        this._producer = this._kafkaClient.producer();

        this._logger = logger;
    }

    async connect() {

        await attachExitHandler(( async () => {

            this._logger.info('Cleaning up kafka connections.');
            await this._admin.disconnect();
            await this._consumer.disconnect();
            await this._producer.disconnect();

        }).bind(this));

        this._logger.info('Connecting to Kafka.');
        await this._admin.connect();
        await this._consumer.connect();
        await this._producer.connect();

        // TODO: Split out into shared package.
        await this._topicCreation([{ topic: 'TWEETS_COLLECTED' , replicationFactor: 1}, { topic: 'TWEET_SENTIMENT_COMPUTED' , replicationFactor: 1}]);

        this._logger.info(`Subscribing to TWEETS_COLLECTED topic`);
        await this._consumer.subscribe({ topic: 'TWEETS_COLLECTED', fromBeginning: true });

        this._logger.info(`Running consumer handlers on each message.`);
        await this._consumer.run({
            eachMessage: async ({message}) => {

                this._logger.debug(`Received kafka message: ${message.value.toString()}`);

                const { economicEntityName, economicEntityType, timeSeriesItems} = JSON.parse(message.value.toString());
                await this._computeSentiment(economicEntityName, economicEntityType, timeSeriesItems);
            }
        });
    }

    /**
     * Get the sentiments associated with the specified economic entity and type.
     *
     * @param {String} economicEntityName - Name of the economic entity (i.e, 'Google').
     * @param {String} economicEntityType - Type of the economic entity (i.e, 'BUSINESS').
     * @param {Object} permissions - Permissions for the user making the request.
     * @returns {Array} - The formatted sentiment objects in array form or [].
     */
     async sentiments(economicEntityName, economicEntityType, permissions) {
        if (!economicEntityName || (typeof economicEntityName != 'string')) return [];

        if (!economicEntityType || (typeof economicEntityType != 'string')) return [];

        if (!hasReadAllAccess(permissions)) return [];

        this._logger.debug(`Querying sentiments for economic entity name: ${economicEntityName}, type: ${economicEntityType}`);

        const databaseData = await this._analysisDataStore.readMostRecentSentiments(economicEntityName, economicEntityType);

        this._logger.debug(`Sentiments read: ${JSON.stringify(databaseData)}`);

        return databaseData.sentiments;
    }

    /**
     * Compute sentiments for the specified tweets.
     *
     * NOTE: This sends a kafka event after sentiment computation.
     *
     * @param {String} economicEntityName - Name of the economic entity (i.e, Google)
     * @param {String} economicEntityType - Type of economic entity (i.e, BUSINESS)
     * @param {Array} timeseriesTweets - Consists of objects of the form { timestamp: <Number>, tweets: [{ text: 'tweet text' }]}
     * @returns
     */
    async _computeSentiment(economicEntityName, economicEntityType, timeseriesTweets) {
        if (!economicEntityName || (typeof economicEntityName != 'string')) return;

        if (!economicEntityType || (typeof economicEntityType != 'string')) return;

        if (!Array.isArray(timeseriesTweets) || (timeseriesTweets.length === 0)) return;

        this._logger.info(`Received timeseries entry: ${JSON.stringify(timeseriesTweets)}`);

        const sentiments = [];
        for (const entry of timeseriesTweets) {
            if (!entry?.timestamp || !Array.isArray(entry?.tweets) || !entry?.tweets?.length) continue;

            sentiments.push( this._averageSentiment(entry) );
        }

        await this._analysisDataStore.createSentiments(moment().unix(), economicEntityName, economicEntityType, sentiments);

        const event = {
            economicEntityName,
            economicEntityType,
            sentiments
        };

        this._logger.info(`Adding event with value: ${JSON.stringify(event)}`);

        await this._producer.send({
            topic: `TWEET_SENTIMENT_COMPUTED`,
            messages: [
                { value: JSON.stringify(event) }
            ]
        });
    }

    /**
     * Get the average sentiment associated with the response from the collection service.
     * @param {Object} timeSeriesEntry - Entry as it's returned from the collection service tweets endpoint.
     * @returns {Object} - An object of the form:
     * {
     *      timestamp: <number>,
     *      score: <float>,
     *      tweets: <array of objects with a text field>
     * }
     */
    _averageSentiment(timeSeriesEntry) {

        const response = {};
        response.timestamp = timeSeriesEntry.timestamp;

        let score = 0;
        for (const tweet of timeSeriesEntry.tweets) {

            const sentiment = this._sentimentLib.analyze(tweet.text.toLowerCase());
            score += sentiment.score;
        }

        score = (score / timeSeriesEntry.tweets.length);

        response.score = score;

        response.tweets = timeSeriesEntry.tweets;

        return response;
    }

    /**
     * Create the specified topics.
     *
     * @param {Array} topics - String array consisting of topic names.
     */
    async _topicCreation(topics) {
        try {
            this._logger.info(`Creating topics ${JSON.stringify(topics)}`);
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
            this._logger.warn(`Creation of topics ${JSON.stringify(topics)} exited with error: ${JSON.stringify(error)}, message: ${error.message.toString()}`);
        }
    }
}

export { AnalysisService };