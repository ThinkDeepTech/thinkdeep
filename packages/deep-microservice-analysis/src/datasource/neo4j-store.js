import {Neo4jDataSource} from '@thinkdeep/apollo-datasource-neo4j';
import moment from 'moment';

/**
 * Provides access to neo4j.
 */
class Neo4jStore extends Neo4jDataSource {
  /**
   * Add tweets to neo4j.
   * @param {Object} economicEntity Object of form { name: <name>, type: <type> }. I.e, { name: 'Google', type: 'BUSINESS' }.
   * @param {Number} timestamp Unix timestamp in seconds.
   * @param {Array<String>} tweets Array of tweets to add.
   */
  async addTweets(economicEntity, timestamp, tweets) {
    if (!timestamp) {
      throw new Error(
        `Adding tweets requires a timestamp. Received ${timestamp}`
      );
    }

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

    if (!Array.isArray(tweets) || tweets.length <= 0) {
      throw new Error(`Adding tweets requires populated tweets to add.`);
    }

    await this.addEconomicEntity(economicEntity);

    await this.addDateToEconomicEntity(economicEntity, timestamp);

    for (const tweet of tweets) {
      this.addTweet(economicEntity, timestamp, tweet);
    }
  }

  /**
   * Add tweet to neo4j.
   * @param {Object} economicEntity Object of form { name: <name>, type: <type> }. I.e, { name: 'Google', type: 'BUSINESS' }.
   * @param {Number} timestamp Unix timestamp in seconds.
   * @param {String} tweet Text string.
   */
  async addTweet(economicEntity, timestamp, tweet) {
    if (!timestamp) {
      throw new Error(
        `Adding tweet requires a timestamp. Received ${timestamp}`
      );
    }

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

    if (tweet.length <= 0) {
      throw new Error(`Adding tweet requires populated tweet to add.`);
    }

    const date = this._date(timestamp);
    const accessMode = this.neo4j.session.WRITE;
    await this.run(
      `
      MATCH (economicEntity:EconomicEntity { name: $entityName, type: $entityType}) -[timeline:HAS_TIMELINE]-> ()
      MATCH (economicEntity) -[timeline]-> (year:DateTime { type: "year", value: $year})
      MATCH (economicEntity) -[timeline]-> (year) -[hasMonths:HAS]-> (month:DateTime { type: "month", value: $month })
      MATCH (economicEntity) -[timeline]-> (year) -[hasMonths]-> (month) -[hasDay:HAS]-> (day:DateTime {type: "day", value: $day})
      MATCH (economicEntity) -[timeline]-> (year) -[hasMonths]-> (month) -[hasDay]-> (day) -[hasHour:HAS]-> (hour:DateTime { type: "hour", value: $hour })
      MATCH (economicEntity) -[timeline]-> (year) -[hasMonths]-> (month) -[hasDay]-> (day) -[hasHour]-> (hour) -[hasMinute:HAS]-> (minute:DateTime {type: "minute", value: $minute })
      MATCH (economicEntity) -[timeline]-> (year) -[hasMonths]-> (month) -[hasDay]-> (day) -[hasHour]-> (hour) -[hasMinute]-> (minute)
      MERGE (economicEntity) -[timeline]-> (year) -[hasMonths]-> (month) -[hasDay]-> (day) -[hasHour]-> (hour) -[hasMinute]-> (minute) -[:HAS_DATA]-> (:Tweet { type: "tweet", value: $tweet })
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
        // TODO: Verify that eliminating this in favor of apollo-datasource-neo4j defaultDatabase still applies access mode.
        database: 'neo4j',
        accessMode,
      }
    );
  }

  /**
   * Add the specified economic entity to neo4j.
   * @param {Object} economicEntity Entity of the form { name: <entity name>, type: <entity type> }, i.e, { name: 'Google', type: 'BUSINESS' }.
   */
  async addEconomicEntity(economicEntity) {
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

    const accessMode = this.neo4j.session.WRITE;
    await this.run(
      `
      MERGE (:EconomicEntity { name: $entityName, type: $entityType})
    `,
      {
        entityName: economicEntity.name,
        entityType: economicEntity.type,
      },
      {
        // TODO: Same as above
        database: 'neo4j',
        accessMode,
      }
    );
  }

  /**
   * Add a timeline.
   * @param {Object} economicEntity Economic entity { name: <name>, type: <type> }. I.e, { name: 'Google', type: 'BUSINESS' }.
   * @param {Number} timestamp Unix timestamp in seconds.
   */
  async addDateToEconomicEntity(economicEntity, timestamp) {
    if (!timestamp) {
      throw new Error(`A timestamp must be included. Received ${timestamp}`);
    }

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

    const date = this._date(timestamp);
    const accessMode = this.neo4j.session.WRITE;
    await this.run(
      `
      MATCH (economicEntity:EconomicEntity { name: $entityName, type: $entityType}) -[timeline:HAS_TIMELINE]-> ()
      MERGE (economicEntity) -[timeline]-> (year:DateTime { type: "year", value: $year})
      MERGE (economicEntity) -[timeline]-> (year) -[hasMonths:HAS]-> (month:DateTime { type: "month", value: $month })
      MERGE (economicEntity) -[timeline]-> (year) -[hasMonths]-> (month) -[hasDay:HAS]-> (day:DateTime {type: "day", value: $day})
      MERGE (economicEntity) -[timeline]-> (year) -[hasMonths]-> (month) -[hasDay]-> (day) -[hasHour:HAS]-> (hour:DateTime { type: "hour", value: $hour })
      MERGE (economicEntity) -[timeline]-> (year) -[hasMonths]-> (month) -[hasDay]-> (day) -[hasHour]-> (hour) -[hasMinute:HAS]-> (minute:DateTime {type: "minute", value: $minute })
      MERGE (economicEntity) -[timeline]-> (year) -[hasMonths]-> (month) -[hasDay]-> (day) -[hasHour]-> (hour) -[hasMinute]-> (minute)
    `,
      {
        entityName: economicEntity.name,
        entityType: economicEntity.type,
        year: date.year(),
        month: date.month(),
        day: date.day(),
        hour: date.hour(),
        minute: date.minute(),
      },
      {
        // TODO: Same as above
        database: 'neo4j',
        accessMode,
      }
    );
  }

  /**
   * Get the unix date as a moment.
   * @param {Number} timestamp Timestamp in seconds
   * @return {moment.Moment} Moment associated with the timestamp.
   */
  _date(timestamp) {
    // TODO: Add helper module that includes moment calc.
    return moment(timestamp * 1000);
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
