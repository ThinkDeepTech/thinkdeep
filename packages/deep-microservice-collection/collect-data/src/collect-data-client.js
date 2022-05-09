import {attachExitHandler} from '@thinkdeep/attach-exit-handler';

/**
 * Client used to execute data collection tasks.
 */
class CollectDataClient {
    /**
     * @param {Object} twitterClient - Twitter API v2 client. See: https://github.com/PLhery/node-twitter-api-v2
     * @param {Object} kafkaClient - KafkaJS client. See: https://github.com/tulios/kafkajs
     * @param {Object} logger - The logger to use.
     */
    constructor(twitterClient, kafkaClient, logger) {
        this._twitterClient = twitterClient;
        this._kafkaClient = kafkaClient;
        this._logger = logger;

        this._admin = this._kafkaClient.admin();
        this._producer = this._kafkaClient.producer();
    }

    /**
     * Connect to all the services on which the client depends.
     */
    async connect() {

        await attachExitHandler((async () => {

            this._logger.info('Disconnecting from kafka.');
            await this._admin.disconnect();
            await this._producer.disconnect();

        }));

        this._logger.info('Connecting to kafka.');
        await this._admin.connect();
        await this._producer.connect();
    }

    /**
     * Fetch recent tweets from the twitter API.
     * @param {Object} query - Query to send to the API. I.e, { query: 'Google', max_results: 100}.
     */
    async fetchRecentTweets(query) {

        this._logger.debug(`Querying recent tweets. Query: ${JSON.stringify(query)}`);
        const response = await this._twitterClient.v2.get('tweets/search/recent', query);
        return response.data;
    }

    /**
     * Emit the specified event into kafka.
     * @param {String} eventName - Name of the event.
     * @param {Object} data - The data associated with the event.
     */
    async emitEvent(eventName, data) {

        this._logger.debug(`Creating event ${eventName} in kafka if it does not already exist.`);
        try {
            await this._admin.createTopics({
                waitForLeaders: true,
                topics: [{
                    topic: eventName,
                    replicationFactor: 1
                }]
            });
        } catch (e) {
            this._logger.warn(`An error occurred while creating the topic: ${e.message.toString()}`);
        }


        this._logger.info(`Emitting event ${eventName}. Data: ${JSON.stringify(data)}`);
        await this._producer.send({
            topic: eventName,
            messages: [
                { value: JSON.stringify(data) }
            ]
        });
    }
}

export { CollectDataClient };