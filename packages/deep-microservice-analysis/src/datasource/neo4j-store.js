import {Neo4jDataSource} from '@thinkdeep/apollo-datasource-neo4j';
import moment from 'moment';

/**
 * Provides access to neo4j.
 */
class Neo4jStore extends Neo4jDataSource {
  /**
   * Add tweets to neo4j.
   * @param {Object} data Data of the form { timestamp: <timestamp>, economicEntity: <economic entity>, tweets: <tweets> }.
   */
  async addTweets(data) {
    const timestamp = data.timestamp;
    if (!timestamp) {
      throw new Error(
        `Adding tweets requires a timestamp. Received ${timestamp}`
      );
    }

    const economicEntity = data.economicEntity;
    if (
      Object.keys(economicEntity).length <= 0 ||
      !economicEntity.name ||
      !economicEntity.type
    ) {
      throw new Error(
        `Invalid economic entity received. name and type are required fields. Received: ${JSON.stringify(
          economicEntity
        )}`
      );
    }

    const tweets = data.tweets;
    if (!Array.isArray(tweets) || tweets.length <= 0) {
      throw new Error(`Adding tweets requires populated tweets to add.`);
    }

    const date = moment(timestamp);
    this._logger.debug(
      `Adding tweets to neo4j for date ${date.formal(
        'LLL'
      )} with value:\n\n${tweets}\n`
    );

    const accessMode = this.neo4j.session.WRITE;
    for (const tweet of tweets) {
      await this.run(
        `
                MERGE (:EconomicEntity { name: $entityName, type: $entityType})
                -[:HAS_TIMELINE]-> ( :DateTime { type: 'year', value: $year} )
                -[:HAS]-> (:DateTime { type: 'month', value: $month})
                -[:HAS]-> (:DateTime { type: 'day', value: $day})
                -[:HAS]-> (:DateTime { type: 'hour', value: $hour})
                -[:HAS]-> (:DateTime { type: 'minute', value: $minute})
                -[:HAS_DATA]-> ( :Tweet { type: 'tweet', value: $tweet})
            `,
        {
          entityName: economicEntity.name,
          entityType: economicEntity.type,
          year: date.year(),
          month: date.month(),
          day: date.day(),
          hour: date.hour(),
          minute: date.minute(),
          tweet,
        },
        {
          database: 'neo4j',
          accessMode,
        }
      );
    }
  }

  /**
   * Get the sentiment.
   * @return {Number} Sentiment value.
   */
  async getSentiment() {
    // TODO
    return 2.5;
  }
}

export {Neo4jStore};
