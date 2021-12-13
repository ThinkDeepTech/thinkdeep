import {MongoDataSource} from 'apollo-datasource-mongodb';


class TweetStore extends MongoDataSource {
    async readTweets(economicEntityName, economicEntityType) {
        try {
            const result = await this.collection.find({
                economicEntityName: economicEntityName.toLowerCase(),
                economicEntityType : economicEntityType.toLowerCase()
            }).toArray();

            return this._reduceTweets(result);
        } catch (e) {
            console.log(`
                An error occurred while reading tweets from the store.
                Error: ${e.message}
            `)
            return [];
        }
    }
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

    _reduceTweets(dbData) {

        // NOTE: All economic entity name and type values should be equivalent so just
        // take the first values and apply to response.
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