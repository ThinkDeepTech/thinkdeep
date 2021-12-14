import {MongoDataSource} from 'apollo-datasource-mongodb';

class TweetStore extends MongoDataSource {

    /**
     * Read recent tweets from the mongo store.
     * @param {String} economicEntityName - Name of the economic entity (i.e, 'Google').
     * @param {String} economicEntityType - Type of the economic entity (i.e, 'BUSINESS').
     * @param {Number} numTweetsToReturn - Number of recent tweets to return.
     * @returns {Array} - Tweets read from the database and formatted for the application or [].
     */
    async readRecentTweets(economicEntityName, economicEntityType, numTweetsToReturn) {

        if (!economicEntityName || (typeof economicEntityName != 'string')) return [];

        if (!economicEntityType || (typeof economicEntityType != 'string')) return [];

        try {
            const result = await this.collection.find({
                economicEntityName: economicEntityName.toLowerCase(),
                economicEntityType : economicEntityType.toLowerCase()
            }).sort({timestamp: -1}).limit(numTweetsToReturn).toArray();

            return this._reduceTweets(result);
        } catch (e) {
            console.log(`
                An error occurred while reading tweets from the store.
                Error: ${e.message}
            `)
            return [];
        }
    }

    /**
     * Create a timeseries entry in the database including tweets.
     * @param {Number} timestamp - Timestamp to associate with the database entry.
     * @param {String} economicEntityName - Name of the economic entity (i.e, 'Google')
     * @param {String} economicEntityType - Type of the economic entity (i.e, 'BUSINESS')
     * @param {Array} tweets - The tweets to add to the database.
     * @returns {Boolean} - True if the operation is successful, false otherwise.
     */
    async createTweets(timestamp, economicEntityName, economicEntityType, tweets) {
        try {
            await this.collection.insertOne({
                timestamp,
                economicEntityName: economicEntityName.toLowerCase(),
                economicEntityType: economicEntityType.toLowerCase(),
                tweets
            });
            return true;
        } catch(e) {
            console.log(`
                Insertion failed for:
                    economicEntityName: ${economicEntityName}
                    economicEntityType: ${economicEntityType}
                    tweets: ${JSON.stringify(tweets)}

                    error: ${e.message}
                    `);
            return false;
        }
    }

    /**
     *  Reduce the database data into a form used by the application.
     * @param {Array} dbData - Data returned from the database.
     * @returns {Array} - Data formatted for the API.
     */
    _reduceTweets(dbData) {

        const response = [];

        for (const entry of dbData) {

            if (!Object.keys(entry).length || !entry?.timestamp) continue;

            response.push({
                timestamp: entry.timestamp,
                tweets: entry.tweets || []
            })
        }

        return response;
    }
};

export { TweetStore };