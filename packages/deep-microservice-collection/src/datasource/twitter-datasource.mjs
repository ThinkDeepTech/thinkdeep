import { RESTDataSource } from 'apollo-datasource-rest';

class TwitterDataSource extends RESTDataSource {

    constructor() {
        super();
        this.baseURL = 'https://api.twitter.com/v2/';
    }

    willSendRequest(request) {
        request.headers.set('Authorization', process.env.PREDECOS_TWITTER_BEARER);
    }

    getTweets(businessName, user) {
        if (!businessName || (typeof businessName != 'string')) return [];

        if (!hasReadAllAccess(user)) return [];

        return this.get(`tweets/search/recent?query=${encodeURIComponent(`${businessName}&lang:en`)}`);
    }
};

export { TwitterDataSource }