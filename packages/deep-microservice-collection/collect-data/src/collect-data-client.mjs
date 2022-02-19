
class CollectDataClient {
    constructor(twitterClient, kafkaClient, logger) {
        this._twitterClient = twitterClient;
        this._kafkaClient = kafkaClient;
        this._logger = logger;

        this._admin = this._kafkaClient.admin();
        this._producer = this._kafkaClient.producer();
    }

    async connect() {

        const performCleanup = (async () => {

            this._logger.info('Disconnecting from kafka.');
            await this._admin.disconnect();
            await this._producer.disconnect();
        }).bind(this);

        const attachExitHandler = async (callback) => {
            process.once('cleanup', callback);
            process.on('exit', () => {
                process.emit('cleanup');
            });
            process.on('SIGINT', () => {
                process.exit(2);
            });
            process.on('uncaughtException', () => {
                process.exit(99);
            });
        };

        await attachExitHandler(performCleanup);

        this._logger.info('Connecting to kafka.');
        await this._admin.connect();
        await this._producer.connect();
    }

    async fetchRecentTweets(query) {

        this._logger.debug(`Querying recent tweets. Query: ${JSON.stringify(query)}`);
        const response = await this._twitterClient.v2.get('tweets/search/recent', query);
        return response.data;
    }

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