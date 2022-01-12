import { hasReadAllAccess } from './permissions.mjs';

class AnalysisService {

    /**
     * Business layer for analysis operations.
     *
     * NOTE: The parameters below are injected because that improves testability of the codebase.
     *
     * @param {Object} dataSource - PostgresDataSource to use when interacting with the database.
     * @param {Object} sentimentLib - Library to use for sentiment analysis. This is an instance of Sentiment from 'sentiment' package.
     * @param {Object} consumer - Kafkajs consumer.
     * @param {Object} producer  - Kafkajs producer.
     * @param {Object} logger - Logger to use.
     */
    constructor(dataSource, sentimentLib, consumer, producer, logger) {
        this._dataSource = dataSource;
        this._sentimentLib = sentimentLib;
        this._consumer = consumer;
        this._producer = producer;
        this._logger = logger;

        this._consumer.subscribe({ topic: 'TWEETS_COLLECTED', fromBeginning: true }).then(async () => {

            await this._consumer.run({
                eachMessage: async ({topic, partition, message}) => {
                    this._logger.debug(`Received kafka message: ${message.value.toString()}`);

                    const { economicEntityName, economicEntityType, timeSeriesItems} = JSON.parse(message.value.toString());
                    await this._computeSentiment(economicEntityName, economicEntityType, timeSeriesItems);
                }
            });

        }, (reason) => {
            this._logger.error(`An error occurred while subscribing to collection microservice events: ${JSON.stringify(reason)}`);
        });
    }

    async _computeSentiment(economicEntityName, economicEntityType, timeseriesTweets) {
        if (!economicEntityName || (typeof economicEntityName != 'string')) return;

        if (!economicEntityType || (typeof economicEntityType != 'string')) return;

        if (!Array.isArray(timeseriesTweets)) return;

        this._logger.info(`Received timeseries entry: ${JSON.stringify(timeseriesTweets)}`);

        const sentiments = [];
        for (const entry of timeseriesTweets) {
            if (!entry?.timestamp || !Array.isArray(entry?.tweets) || !entry?.tweets?.length) continue;

            sentiments.push( this._averageSentiment(entry) );
        }

        const event = {
            economicEntityName,
            economicEntityType,
            sentiments
        };

        this._logger.info(`Adding event with value: ${JSON.stringify(sentiments)}`);

        await this._producer.send({
            topic: 'TWEET_SENTIMENT_COMPUTED',
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
}

export { AnalysisService };