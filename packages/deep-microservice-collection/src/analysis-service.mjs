import Sentiment from 'sentiment';
import { hasReadAllAccess } from './permissions.mjs';

class AnalysisService {

    constructor(twitterDataSource) {
        this._dataSource = twitterDataSource;
    }

    async getSentiment(businessName, user) {
        if (!businessName || (typeof businessName != 'string')) return [];

        // if (!hasReadAllAccess(user)) return [];

        const tweets = await this._dataSource.getTweets(businessName);

        const sentiments = [];
        for (const tweet of tweets) {
            if (!tweet?.text) continue;
            const result = this._runSentimentAnalysis(tweet.text);
            result.businessName = businessName;
            sentiments.push(result);
        }

        // const timestamp = Date.now();
        // this._storeSentiments(timestamp, businessName, sentiments);

        return sentiments;
    }

    _runSentimentAnalysis(text) {
        const sentiment = new Sentiment();
        const result = sentiment.analyze(text);
        return result;
    }

    _storeSentimentResults(timestamp, businessName, sentiments) {
        // TODO
    }
}

export { AnalysisService };