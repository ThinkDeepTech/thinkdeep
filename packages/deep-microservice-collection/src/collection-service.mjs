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

        const strategy = this._strategy(entityType).bind(this);

        const success = await strategy(entityName);

        return { success };
    }

    async tweets(economicEntityName, economicEntityType, user, tweetStore = this._tweetStore) {

        if (!economicEntityName || (typeof economicEntityName != 'string')) return [];

        if (!economicEntityType || (typeof economicEntityType != 'string')) return [];

        if (!hasReadAllAccess(user)) return [];

        return await tweetStore.readTweets(economicEntityName, economicEntityType);
    }

    _strategy(entityType, businessHandler = this._collectBusinessData) {
        const type = entityType.toLowerCase();
        if (type === 'business') {
            return businessHandler;
        } else {
            throw new Error('The specified economic type was unknown.')
        }
    }

    async _collectBusinessData(businessName, twitterAPI = this._twitterAPI, tweetStore = this._tweetStore) {

        const data = await twitterAPI.tweets(businessName);

        const timestamp = moment().unix();

        const success = await tweetStore.createTweets(timestamp, businessName, 'business', data);

        return success;
    }
}

export { CollectionService };