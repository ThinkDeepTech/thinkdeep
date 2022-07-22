import {validEconomicEntities} from '@thinkdeep/type';
import {MongoDataSource} from 'apollo-datasource-mongodb';
import moment from 'moment';

/**
 * Store providing interaction with twitter tweet database collection.
 */
class TweetStore extends MongoDataSource {
  /**
   * Read recent tweets from the mongo store.
   * @param {Object} economicEntity Economic entity for which the check is being conducted.
   * @param {Number} numTweetsToReturn - Number of recent tweets to return.
   * @return {Array} - Tweets read from the database and formatted for the application or [].
   */
  async readRecentTweets(economicEntity, numTweetsToReturn) {
    if (!validEconomicEntities([economicEntity])) {
      throw new Error(
        `Economic entity was invalid. Received: ${economicEntity.toString()}`
      );
    }

    try {
      const result = await this.collection
        .find({economicEntity: economicEntity.toObject()})
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
   * @param {Object} economicEntity Economic entity for which the check is being conducted.
   * @param {Array} tweets The tweets to add to the database.
   * @return {Boolean} True if the operation is successful, false otherwise.
   */
  async createTweets(utcDateTime, economicEntity, tweets) {
    if (!validEconomicEntities([economicEntity])) {
      throw new Error(
        `Economic entity was invalid. Received: ${economicEntity.toString()}`
      );
    }

    try {
      await this.collection.insertOne({
        utcDateTime: moment.utc(utcDateTime).toDate(),
        economicEntity: economicEntity.toObject(),
        tweets,
      });
      return true;
    } catch (e) {
      console.log(`
                Database insertion failed for:
                    economicEntity:
                      name ${economicEntity.name}
                      type ${economicEntity.type}
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
      if (!Object.keys(entry).length || !entry?.utcDateTime) continue;

      response.push({
        utcDateTime: entry.utcDateTime,
        tweets: entry.tweets || [],
      });
    }

    return response;
  }
}

export {TweetStore};
