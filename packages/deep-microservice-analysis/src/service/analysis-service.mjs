
import { hasReadAllAccess } from '../permissions.mjs';
import Sentiment from 'sentiment';

class AnalysisService {

    constructor(dataSource) {
        this._dataSource = dataSource;
        this._sentiment = new Sentiment();
    }

    /**
     *  Get the business relationships associated with the named business.
     * @param {String} businessName
     * @param {Object} user
     * @return {Array} The desired business relationships in array form or []
     */
    getBusinessRelationships(businessName, user) {
        if (!businessName || (typeof businessName != 'string')) return [];

        if (!hasReadAllAccess(user)) return [];

        return this._dataSource.getBusinessGraph(businessName);
    }

    getSentiment(economicEntityName, economicEntityType, user) {
        if (!economicEntityName || (typeof economicEntityName != 'string')) return {};

        if (!economicEntityType || (typeof economicEntityType != 'string')) return {};

        if (!hasReadAllAccess(user)) return {};

        // const collectionService = new CollectionService();

        // const data = collectionService.getTweets(economicEntityName, economicEntityType, user);

        // const sentiments = [];
        // for (const tweet of data.tweets) {
        //     if (!tweet?.text) continue;
        //     const sentiment = this._sentiment.analyze(tweet.text.toLowerCase());
        //     sentiments.push(sentiment);
        // }

        // const success = this.storeAnalyzedData(economicEntityName, economicEntityType, sentiments, user);

        // return { sentiments };

        return {
            sentiments: [{
                timestamp: 1,
                score: -3,
                tweets: [{
                    text: 'Something worth saying here! Angerly!'
                },{
                    text: 'This is much more incredible :-D'
                }]
            },{
                timestamp: 2,
                score: 2,
                tweets: [{
                    text: "They've gotten better so far..."
                }, {
                    text: "I don't know whats happening!!!"
                }, {
                    text: "I had a good time at this place."
                }]
            },{
                timestamp: 3,
                score: -0.5,
                tweets: [{
                    text: "It was great!"
                }]
            },{
                timestamp: 4,
                score: 3,
                tweets: [{
                    text: "Woohoo"
                }, {
                    text: "I had a tough time with the product but it was okay."
                }, {
                    text: "What a great product!"
                },{
                    text: "Wow, that's awesome!"
                },{
                    text: "It was cool. I think I'd go back."
                }]
            },{
                timestamp: 5,
                score: 4,
                tweets: [{
                    text: "I thought it was great."
                }, {
                    text: "I'd use their services again."
                }, {
                    text: "Such good employees"
                },{
                    text: "Wow, that's awesome!"
                },{
                    text: "It was cool. I think I'd go back."
                },{
                    text: "Awesomeness..."
                }]
            }]
        };
    }
}

export { AnalysisService };