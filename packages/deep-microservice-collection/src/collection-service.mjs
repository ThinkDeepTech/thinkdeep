import moment from 'moment';
import { hasReadAllAccess } from './permissions.mjs';
import Sentiment from 'sentiment';

class CollectionService {

    constructor(twitterDataSource) {
        this._twitterDataSource = twitterDataSource;
        // TODO:
        // this._kdbDataSource = kdbDataSource;
    }

    async collectEconomicData(entityName, entityType, user) {
        if (!entityName || (typeof entityName != 'string')) return { success: false };

        if (!entityType || (typeof entityType != 'string')) return { success: false };

        if (!hasReadAllAccess(user)) return { success: false};

        const strategy = this._getStrategy(entityType).bind(this);

        const success = await strategy(entityName);

        return { success };
    }

    _getStrategy(entityType, businessHandler = this._collectBusinessData) {
        const type = entityType.toLowerCase();
        if (type === 'business') {
            return businessHandler;
        } else {
            throw new Error('The specified economic type was unknown.')
        }
    }

    async _collectBusinessData(businessName, twitterDataSource = this._twitterDataSource, sentiment = this._sentiment) {

        const data = await twitterDataSource.getTweets(businessName);

        const timestamp = moment().unix();

        // const isStored = await kdbDataSource.store(timestamp, data);

        // const sentiments = [];
        // for (const tweet of tweets) {
        //     if (!tweet?.text) continue;
        //     const result = this._sentiment.analyze(tweet.text.toLowerCase());
        //     result.businessName = businessName;
        //     sentiments.push(result);
        // }

        // const timestamp = Date.now();
        // this._storeSentiments(timestamp, businessName, sentiments);

        // return sentiments;
        // return isStored;
        return true;
    }

    _storeSentimentResults(timestamp, businessName, sentiments) {
        // TODO
    }
}

export { CollectionService };