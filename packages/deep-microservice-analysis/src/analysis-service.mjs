import { hasReadAllAccess } from './permissions.mjs';

class AnalysisService {

    /**
     * Business layer for analysis operations.
     *
     * NOTE: The parameters below are injected because that improves testability of the codebase.
     *
     * @param {Object} dataSource - PostgresDataSource object to use when interacting with the database.
     * @param {Object} sentimentLib - Library to use for sentiment analysis. This is an instance of Sentiment from 'sentiment' package.
     * @param {Object} collectionBinding - CollectionBinding object to use when communicating with the collection service.
     */
    constructor(dataSource, sentimentLib, collectionBinding, logger) {
        this._dataSource = dataSource;
        this._sentimentLib = sentimentLib;
        this._collectionBinding = collectionBinding;
        this._logger = logger;
    }

    /**
     * Get the sentiments associated with the specified economic entity and type.
     *
     * @param {String} economicEntityName - Name of the economic entity (i.e, 'Google').
     * @param {String} economicEntityType - Type of the economic entity (i.e, 'BUSINESS').
     * @param {Object} user - The user requesting the data.
     * @param {Object} collectionBinding - The collection microservice binding. This parameter is present for testing purposes and isn't intended for regular use.
     * @returns {Array} - The formatted sentiment objects in array form or [].
     */
    async sentiments(economicEntityName, economicEntityType, user, collectionBinding = this._collectionBinding, logger = this._logger) {
        if (!economicEntityName || (typeof economicEntityName != 'string')) return [];

        if (!economicEntityType || (typeof economicEntityType != 'string')) return [];

        if (!hasReadAllAccess(user)) return [];

        logger.debug(`Querying sentiments for economic entity name: ${economicEntityName}, type: ${economicEntityType}`);

        logger.debug(`Fetching tweets for economic entity with name: ${economicEntityName}, type: ${economicEntityType}`);
        const data = await collectionBinding.query.tweets({ economicEntityName, economicEntityType },
            `
            {
                timestamp
                tweets {
                    text
                }
            }
            `, { context: { user } });
        logger.debug(`Received tweets: ${JSON.stringify(data)}`);

        const sentiments = [];
        for (const entry of data) {
            if (!entry?.timestamp || !Array.isArray(entry?.tweets) || !entry?.tweets?.length) continue;

            sentiments.push( this._averageSentiment(entry) );
        }

        logger.debug(`Finished computing sentiments: ${JSON.stringify(sentiments)}`);

        return sentiments;
    }

    /**
     * Get the average sentiment associated with the response from the collection service.
     * @param {Object} timeSeriesEntry - Entry as it's returned from the collection service tweets endpoint.
     * @param {Object} sentimentLib - Sentiment library to use. This should be an instance of Sentiment from the 'sentiment' package. This is used for testing purposes.
     * @returns {Object} - An object of the form:
     * {
     *      timestamp: <number>,
     *      score: <float>,
     *      tweets: <array of objects with a text field>
     * }
     */
    _averageSentiment(timeSeriesEntry, sentimentLib = this._sentimentLib) {

        const response = {};
        response.timestamp = timeSeriesEntry.timestamp;

        let score = 0;
        for (const tweet of timeSeriesEntry.tweets) {

            const sentiment = sentimentLib.analyze(tweet.text.toLowerCase());
            score += sentiment.score;
        }

        score = (score / timeSeriesEntry.tweets.length);

        response.score = score;

        response.tweets = timeSeriesEntry.tweets;

        return response;
    }
}

export { AnalysisService };