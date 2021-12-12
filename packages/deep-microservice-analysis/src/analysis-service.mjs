import { CollectionBinding } from './collection-binding.mjs';
import { hasReadAllAccess } from './permissions.mjs';
import Sentiment from 'sentiment';

class AnalysisService {

    constructor(dataSource) {
        this._dataSource = dataSource;
        this._sentimentLib = new Sentiment();
    }

    /**
     *  Get the business relationships associated with the named business.
     * @param {String} businessName
     * @param {Object} user
     * @return {Array} The desired business relationships in array form or []
     */
    async getBusinessRelationships(businessName, user) {
        if (!businessName || (typeof businessName != 'string')) return [];

        if (!hasReadAllAccess(user)) return [];

        return this._dataSource.getBusinessGraph(businessName);
    }

    async getSentiment(economicEntityName, economicEntityType, user) {
        if (!economicEntityName || (typeof economicEntityName != 'string')) return {};

        if (!economicEntityType || (typeof economicEntityType != 'string')) return {};

        if (!hasReadAllAccess(user)) return {};

        // Wait for creation of service binding to succeed.
        const collectionBinding = await CollectionBinding.create();

        const data = await collectionBinding.query.getTweets({ economicEntityName, economicEntityType },
            `
            {
                timeSeries {
                    timestamp
                    tweets {
                        text
                    }
                }
            }
            `, { context: { user } });

        if (!data?.timeSeries) return { sentiments: [] };

        const response = { sentiments: []};
        for (const entry of data.timeSeries) {
            if (!entry?.timestamp) continue;

            const sentiment = this._getAverageSentiment(entry);
            response.sentiments.push(sentiment);
        }

        // const isStored = this.storeAnalyzedData(economicEntityName, economicEntityType, sentiments, user);

        return response;

        // return {
        //     sentiments: [{
        //         timestamp: 1,
        //         score: -3,
        //         tweets: [{
        //             text: 'Something worth saying here! Angerly!'
        //         },{
        //             text: 'This is much more incredible :-D'
        //         }]
        //     },{
        //         timestamp: 2,
        //         score: 2,
        //         tweets: [{
        //             text: "They've gotten better so far..."
        //         }, {
        //             text: "I don't know whats happening!!!"
        //         }, {
        //             text: "I had a good time at this place."
        //         }]
        //     },{
        //         timestamp: 3,
        //         score: -0.5,
        //         tweets: [{
        //             text: "It was great!"
        //         }]
        //     },{
        //         timestamp: 4,
        //         score: 3,
        //         tweets: [{
        //             text: "Woohoo"
        //         }, {
        //             text: "I had a tough time with the product but it was okay."
        //         }, {
        //             text: "What a great product!"
        //         },{
        //             text: "Wow, that's awesome!"
        //         },{
        //             text: "It was cool. I think I'd go back."
        //         }]
        //     },{
        //         timestamp: 5,
        //         score: 4,
        //         tweets: [{
        //             text: "I thought it was great."
        //         }, {
        //             text: "I'd use their services again."
        //         }, {
        //             text: "Such good employees"
        //         },{
        //             text: "Wow, that's awesome!"
        //         },{
        //             text: "It was cool. I think I'd go back."
        //         },{
        //             text: "Awesomeness..."
        //         }]
        //     }]
        // };
    }

    _getAverageSentiment(timeSeriesEntry, sentimentLib = this._sentimentLib) {
        if (!timeSeriesEntry?.timestamp) return {};

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