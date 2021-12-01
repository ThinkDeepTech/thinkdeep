import { RESTDataSource } from 'apollo-datasource-rest';

class TwitterDataSource extends RESTDataSource {

    constructor() {
        super();
        this.baseURL = 'https://api.twitter.com/2/';
        this.initialize({});
    }

    async getTweets(businessName) {
        if (!businessName || (typeof businessName != 'string')) return [];

        const endPoint = `tweets/search/recent?query=${encodeURIComponent(`${businessName} lang:en`)}`;
        const payload = await this.get(endPoint, {}, {
            headers: {
                Authorization: `Bearer ${process.env.PREDECOS_TWITTER_BEARER}`
            }
        });
        return this.reduceTweets(payload);
    }

    reduceTweets(payload) {
        if (!payload?.data) return [];

        return payload.data;
    }
};

export { TwitterDataSource }