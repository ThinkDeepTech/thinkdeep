import moment from 'moment';
import { hasReadAllAccess } from './permissions.mjs';

class CollectionService {

    constructor(twitterAPI, tweetStore) {
        this._twitterAPI = twitterAPI;
        this._tweetStore = tweetStore;
    }

    async collectEconomicData(entityName, entityType, user) {
        if (!entityName || (typeof entityName != 'string')) return { success: false };

        if (!entityType || (typeof entityType != 'string')) return { success: false };

        if (!hasReadAllAccess(user)) return { success: false};

        const strategy = this._getStrategy(entityType).bind(this);

        const success = await strategy(entityName);

        return { success };
    }

    async getTweets(economicEntityName, economicEntityType, user, tweetStore = this._tweetStore) {

        if (!hasReadAllAccess(user)) return { economicEntityName, economicEntityType, timeSeries: []};

        return await tweetStore.readTweets(economicEntityName, economicEntityType);
    }

    _getStrategy(entityType, businessHandler = this._collectBusinessData) {
        const type = entityType.toLowerCase();
        if (type === 'business') {
            return businessHandler;
        } else {
            throw new Error('The specified economic type was unknown.')
        }
    }

    async _collectBusinessData(businessName, twitterAPI = this._twitterAPI, tweetStore = this._tweetStore) {

        const data = await twitterAPI.getTweets(businessName);

        const timestamp = moment().unix();

        const success = await tweetStore.createTweets(timestamp, businessName, 'business', data);

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
        // return true;
        return success;
    }
}

export { CollectionService };