import {Neo4jDataSource} from '@thinkdeep/apollo-datasource-neo4j';
import moment from 'moment';

/**
 * Provides access to neo4j.
 */
class Neo4jStore extends Neo4jDataSource {
  /**
   * Add sentiments to neo4j.
   * @param {Object} economicEntity Object of form { name: <name>, type: <type> }. I.e, { name: 'Google', type: 'BUSINESS' }.
   * @param {Number} timestamp Unix timestamp in seconds.
   * @param {Array<Object>} datas Array of the form [{ tweet: <tweet>, sentiment: <sentiment> }]
   */
  async addSentiments(economicEntity, timestamp, datas) {
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

    if (!Array.isArray(datas) || datas.length <= 0) {
      throw new Error(`Adding data requires populated data to add.`);
    }

    await this.addEconomicEntity(economicEntity);

    await this.addDateToEconomicEntity(economicEntity, timestamp);

    for (const data of datas) {
      this.addSentiment(economicEntity, timestamp, data);
    }
  }

  /**
   * Add sentiment and tweet to neo4j.
   * @param {Object} economicEntity Object of form { name: <name>, type: <type> }. I.e, { name: 'Google', type: 'BUSINESS' }.
   * @param {Number} timestamp Unix timestamp in seconds.
   * @param {Object} data Object of the form { tweet: <tweet>, sentiment: <sentiment> }
   */
  async addSentiment(economicEntity, timestamp, data) {
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

    if (
      Object.keys(data).length <= 0 ||
      !data.tweets ||
      Number.isNaN(data.sentiment)
    ) {
      throw new Error(
        `Invalid data received. tweet and sentiment are required fields. Received: ${JSON.stringify(
          data
        )}`
      );
    }

    const date = this._date(timestamp);
    const accessMode = this.neo4j.session.WRITE;
    await this.run(
      `
      MATCH (economicEntity:EconomicEntity { name: $entityName, type: $entityType})
      MATCH (economicEntity) -[:HAS_TIMELINE]-> (year:DateTime { type: "year", value: $year})
      MATCH (year) -[:HAS]-> (month:DateTime { type: "month", value: $month })
      MATCH (month) -[:HAS]-> (day:DateTime {type: "day", value: $day})
      MATCH (day) -[:HAS]-> (hour:DateTime { type: "hour", value: $hour })
      MATCH (hour) -[:HAS]-> (minute:DateTime {type: "minute", value: $minute })
      MERGE (minute) -[:HAS_DATA]-> (data:Data { type: "tweet", value: $tweet })
      MERGE (data) -[:HAS_MEASUREMENT]-> (:Sentiment { value: $sentiment })
    `,
      {
        entityName: economicEntity.name,
        entityType: economicEntity.type,
        year: this._year(date),
        month: this._month(date),
        day: this._day(date),
        hour: this._hour(date),
        minute: this._minute(date),
        tweet: data.tweet,
        sentiment: data.sentiment,
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
      MATCH (economicEntity:EconomicEntity { name: $entityName, type: $entityType})
      MERGE (economicEntity) -[:HAS_TIMELINE]-> (year:DateTime { type: "year", value: $year})
      MERGE (year) -[:HAS]-> (month:DateTime { type: "month", value: $month })
      MERGE (month) -[:HAS]-> (day:DateTime {type: "day", value: $day})
      MERGE (day) -[:HAS]-> (hour:DateTime { type: "hour", value: $hour })
      MERGE (hour) -[:HAS]-> (minute:DateTime {type: "minute", value: $minute })
    `,
      {
        entityName: economicEntity.name,
        entityType: economicEntity.type,
        year: this._year(date),
        month: this._month(date),
        day: this._day(date),
        hour: this._hour(date),
        minute: this._minute(date),
      },
      {
        // TODO: Same as above
        database: 'neo4j',
        accessMode,
      }
    );
  }

  /**
   * Read the sentiment.
   * @param {Object} economicEntity Subject for which sentiment will be read.
   * @param {Number} startDate Unix timestamp representing start date (in seconds). TODO
   * @param {Number} endDate Unix timestamp representing end date (in seconds). TODO
   * @return {Object} Sentiment.
   */
  async readSentiment(economicEntity, startDate, endDate) {
    return this.run(
      `
        MATCH (:EconomicEntity { name: $entityName, type: $entityType}) -[*6..6]-> (tweet:Data { type: "tweet" }) -[:HAS_MEASUREMENT]-> (sentiment:Sentiment)
        RETURN tweet, sentiment
      `,
      {
        entityName: economicEntity.name,
        entityType: economicEntity.type,
      },
      {
        database: 'neo4j',
        accessMode: this.neo4j.session.READ,
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
   * Get the year.
   * @param {moment.Moment} mnt Moment for which to gather info.
   * @return {Number}
   */
  _year(mnt) {
    return mnt.year();
  }

  /**
   * Get the month.
   * @param {moment.Moment} mnt Moment for which to gather info.
   * @return {Number}
   */
  _month(mnt) {
    return mnt.month();
  }

  /**
   * Get the day.
   * @param {moment.Moment} mnt Moment for which to gather info.
   * @return {Number}
   */
  _day(mnt) {
    return mnt.day();
  }

  /**
   * Get the hour.
   * @param {moment.Moment} mnt Moment for which to gather info.
   * @return {Number}
   */
  _hour(mnt) {
    return mnt.hour();
  }

  /**
   * Get the minute.
   * @param {moment.Moment} mnt Moment for which to gather info.
   * @return {Number}
   */
  _minute(mnt) {
    return mnt.minute();
  }
}

export {Neo4jStore};
