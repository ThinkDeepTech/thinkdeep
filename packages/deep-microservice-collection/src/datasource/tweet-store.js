import {MongoDataSource} from 'apollo-datasource-mongodb';
import moment from 'moment';

/**
 * Store providing interaction with twitter tweet database collection.
 */
class TweetStore extends MongoDataSource {
  /**
   * Read recent tweets from the mongo store.
   * @param {String} economicEntityName - Name of the economic entity (i.e, 'Google').
   * @param {String} economicEntityType - Type of the economic entity (i.e, 'BUSINESS').
   * @param {Number} numTweetsToReturn - Number of recent tweets to return.
   * @return {Array} - Tweets read from the database and formatted for the application or [].
   */
  async readRecentTweets(
    economicEntityName,
    economicEntityType,
    numTweetsToReturn
  ) {
    if (!economicEntityName || typeof economicEntityName !== 'string')
      return [];

    if (!economicEntityType || typeof economicEntityType !== 'string')
      return [];

    try {
      const result = await this.collection
        .find({
          economicEntityName: economicEntityName.toLowerCase(),
          economicEntityType: economicEntityType.toLowerCase(),
        })
        .sort({utcDateTime: -1})
        .limit(numTweetsToReturn)
        .toArray();

      return this._reduceTweets(result);
    } catch (e) {
      console.log(`
                An error occurred while reading tweets from the store.
                Error: ${e.message}
            `);
      return [];
    }
  }

  /**
   * Create a timeseries entry in the database including tweets.
   * @param {String} utcDateTime UTC date time.
   * @param {String} economicEntityName Name of the economic entity (i.e, 'Google')
   * @param {String} economicEntityType Type of the economic entity (i.e, 'BUSINESS')
   * @param {Array} tweets The tweets to add to the database.
   * @return {Boolean} True if the operation is successful, false otherwise.
   */
  async createTweets(
    utcDateTime,
    economicEntityName,
    economicEntityType,
    tweets
  ) {
    try {
      await this.collection.insertOne({
        utcDateTime: new Date(moment.utc(utcDateTime).toDate()),
        economicEntityName: economicEntityName.toLowerCase(),
        economicEntityType: economicEntityType.toLowerCase(),
        tweets,
      });
      return true;
    } catch (e) {
      console.log(`
                Database insertion failed for:
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
   * @return {Array} - Data formatted for the API.
   */
  _reduceTweets(dbData) {
    const response = [];

    for (const entry of dbData) {
      if (!Object.keys(entry).length || !entry?.timestamp) continue;

      response.push({
        timestamp: entry.timestamp,
        tweets: entry.tweets || [],
      });
    }

    return response;
  }
}

export {TweetStore};
