import {MongoDataSource} from 'apollo-datasource-mongodb';

class AnalysisDataStore extends MongoDataSource {

    /**
     * Read the most recent sentiment from the store.
     *
     * @param {String} economicEntityName - Name of the economic entity (i.e, 'Google').
     * @param {String} economicEntityType - Type of the economic entity (i.e, 'BUSINESS').
     * @returns {Array} - Tweets read from the database and formatted for the application or [].
     */
    async readMostRecentSentiments(economicEntityName, economicEntityType) {

        if (!economicEntityName || (typeof economicEntityName != 'string')) return [];

        if (!economicEntityType || (typeof economicEntityType != 'string')) return [];

        try {
            const result = await this.collection.find({
                economicEntityName: economicEntityName.toLowerCase(),
                economicEntityType : economicEntityType.toLowerCase()
            }).sort({timestamp: -1}).limit(1).toArray();

            return this._reduceSentiments(result)[0];
        } catch (e) {
            console.log(`
                An error occurred while reading tweets from the store.
                Error: ${e.message}
            `)
            return [];
        }
    }

    /**
     * Create a sentiment entry in the database.
     *
     * @param {Number} timestamp - Timestamp associated with the entry.
     * @param {String} economicEntityName - Name of the economic entity (i.e, 'Google')
     * @param {String} economicEntityType - Type of the economic entity (i.e, 'BUSINESS')
     * @param {Array} sentiments - Items to add to the database.
     * @returns {Boolean} - True if the operation is successful, false otherwise.
     */
    async createSentiments(timestamp, economicEntityName, economicEntityType, sentiments) {
        try {
            await this.collection.insertOne({
                timestamp,
                economicEntityName: economicEntityName.toLowerCase(),
                economicEntityType: economicEntityType.toLowerCase(),
                sentiments
            });
            return true;
        } catch(e) {
            console.log(`
                Insertion failed for:
                    economicEntityName: ${economicEntityName}
                    economicEntityType: ${economicEntityType}
                    sentiments: ${JSON.stringify(sentiments)}

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
    _reduceSentiments(dbData) {

        const response = [];

        for (const entry of dbData) {

            if (!Object.keys(entry).length || !entry?.timestamp) continue;

            response.push({
                timestamp: entry.timestamp,
                sentiments: entry.sentiments || []
            })
        }

        return response;
    }
};

export { AnalysisDataStore };