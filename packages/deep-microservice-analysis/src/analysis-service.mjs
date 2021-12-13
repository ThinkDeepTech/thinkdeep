import { hasReadAllAccess } from './permissions.mjs';

class AnalysisService {

    constructor(dataSource, sentimentLib, collectionBinding) {
        this._dataSource = dataSource;
        this._sentimentLib = sentimentLib;
        this._collectionBinding = collectionBinding;
    }

    async sentiments(economicEntityName, economicEntityType, user, collectionBinding = this._collectionBinding) {
        if (!economicEntityName || (typeof economicEntityName != 'string')) return [];

        if (!economicEntityType || (typeof economicEntityType != 'string')) return [];

        if (!hasReadAllAccess(user)) return [];

        const data = await collectionBinding.query.tweets({ economicEntityName, economicEntityType },
            `
            {
                timestamp
                tweets {
                    text
                }
            }
            `, { context: { user } });

        const sentiments = [];
        for (const entry of data) {
            if (!entry?.timestamp) continue;

            sentiments.push( this._averageSentiment(entry) );
        }

        return sentiments;
    }

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