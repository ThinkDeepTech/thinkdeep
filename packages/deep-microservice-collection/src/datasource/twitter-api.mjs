import { RESTDataSource } from 'apollo-datasource-rest';

class TwitterAPI extends RESTDataSource {

    constructor() {
        super();
        this.baseURL = 'https://api.twitter.com/2/';
        this.initialize({});
    }

    async getTweets(businessName) {
        if (!businessName || (typeof businessName != 'string')) return [];

        try{
            const endPoint = `tweets/search/recent?query=${encodeURIComponent(`${businessName} lang:en`)}`;
            const payload = await this.get(endPoint, {}, {
                headers: {
                    Authorization: `Bearer ${process.env.PREDECOS_TWITTER_BEARER}`
                }
            });
            return this.reduceTweets(payload);
        } catch (e) {
            // TODO: Tests
            console.log(`An error occurred while fetching tweets from the twitter API: ${e.msg}`);
            return [];
        }
    }

    reduceTweets(payload) {
        if (!payload?.data) return [];

        return payload.data;
    }
};

export { TwitterAPI }