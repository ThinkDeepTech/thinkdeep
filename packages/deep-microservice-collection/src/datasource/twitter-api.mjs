import { RESTDataSource } from 'apollo-datasource-rest';

class TwitterAPI extends RESTDataSource {

    constructor() {
        super();
        this.baseURL = 'https://api.twitter.com/2/';
        this.initialize({});
    }

    /**
     * Force clear of memoized request results before each request.
     */
    willSendRequest() {
        this.memoizedResults.clear();
    }

    /**
     * Fetch tweets from the twitter API.
     * @param {String} businessName - Name of the business being searched.
     * @returns {Array} - The tweets returned from the API or [].
     */
    async tweets(businessName) {
        if (!businessName || (typeof businessName != 'string')) return [];

        try{
            const endPoint = `tweets/search/recent?query=${encodeURIComponent(`${businessName} lang:en`)}`;
            const payload = await this.get(endPoint, {}, {
                headers: {
                    Authorization: `Bearer ${process.env.PREDECOS_TWITTER_BEARER}`
                },
                cache: 'no-store'
            });
            return this._reduceTweets(payload);

        } catch (e) {

            console.log(`An error occurred while fetching tweets from the twitter API: ${e.msg}`);
            return [];
        }
    }

    /**
     * Simple reducer converting API data to application format.
     * @param {Object} payload - Data returned from the API.
     * @returns {Array} - Tweets in array form or [].
     */
    _reduceTweets(payload) {
        if (!payload?.data) return [];

        return payload.data;
    }
};

export { TwitterAPI }