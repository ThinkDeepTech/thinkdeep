import {Neo4jDataSource} from '@thinkdeep/apollo-datasource-neo4j';
import {validEconomicEntities} from '@thinkdeep/model';
import {validDate} from '@thinkdeep/util';

/**
 * Determine if a value is a valid end date.
 * @param {any} val
 * @return {Boolean} True if valid. False otherwise.
 */
const validEndDate = (val) => {
  return val === null || validDate(val);
};

/**
 * Provides access to neo4j.
 */
class Neo4jStore extends Neo4jDataSource {
  /**
   * Add sentiments to neo4j.
   * @param {Object} economicEntity Object of form { name: <name>, type: <type> }. I.e, { name: 'Google', type: 'BUSINESS' }.
   * @param {Array<Object>} datas Array of the form [{ utcDateTime: <UTC date time string>, tweet: <tweet>, sentiment: <sentiment> }]
   */
  async addSentiments(economicEntity, datas) {
    if (!validEconomicEntities([economicEntity])) {
      throw new Error(
        `Invalid economic entity received:\n${JSON.stringify(economicEntity)}`
      );
    }

    if (!Array.isArray(datas) || datas.length <= 0) {
      throw new Error(`Adding data requires populated data to add.`);
    }

    for (const data of datas) {
      if (!validDate(data.utcDateTime)) {
        throw new Error(
          `A UTC date time is required. Received ${data.utcDateTime}`
        );
      }
    }

    await this._addEconomicEntity(economicEntity);

    for (const data of datas) {
      await this._addDateToEconomicEntity(economicEntity, data.utcDateTime);

      await this._addSentiment(economicEntity, data.utcDateTime, data);
    }
  }

  /**
   * Read the sentiments.
   * @param {Object} economicEntity Subject for which sentiment will be read.
   * @param {String} startDate UTC date time.
   * @param {String} endDate UTC date time.
   * @return {Object} Sentiment.
   */
  async readSentiments(economicEntity, startDate, endDate) {
    if (!validEconomicEntities([economicEntity])) {
      throw new Error(
        `Invalid economic entity received:\n${JSON.stringify(economicEntity)}`
      );
    }

    if (!validDate(startDate)) {
      throw new Error(`The start date ${startDate} is invalid.`);
    }

    if (!validEndDate(endDate)) {
      throw new Error(`The end date ${endDate} is invalid.`);
    }

    const databaseData = await this.run(
      `
        MATCH (:EconomicEntity { name: $entityName, type: $entityType}) -[:OPERATED_ON]-> (dateTime:DateTime) -[:RECEIVED_DATA]-> (tweet:Data { type: "tweet" }) -[:RECEIVED_MEASUREMENT]-> (sentiment:Sentiment)
        WHERE datetime($startDate) <= dateTime.value ${
          !endDate ? `` : ` AND dateTime.value <= datetime($endDate)`
        }
        WITH dateTime, tweet, sentiment
        ORDER BY dateTime.value
        RETURN apoc.date.format(dateTime.value.epochMillis, 'ms', "yyyy-MM-dd'T'HH:mm:ss'Z'") as utcDateTime, collect(tweet) as tweets, avg(sentiment.comparative) as comparativeAvg
      `,
      {
        entityName: economicEntity.name,
        entityType: economicEntity.type,
        startDate,
        endDate,
      }
    );

    return this._reduceSentimentGraph(databaseData);
  }

  /**
   * Read the sentiment.
   * @param {Object} economicEntity Subject for which sentiment will be read.
   * @return {Object} Sentiment.
   */
  async readMostRecentSentiment(economicEntity) {
    if (!validEconomicEntities([economicEntity])) {
      throw new Error(
        `Invalid economic entity received:\n${JSON.stringify(economicEntity)}`
      );
    }

    // TODO: Use functions to return query string components that are shared among functions.
    const databaseData = await this.run(
      `
        MATCH (:EconomicEntity { name: $entityName, type: $entityType}) -[:OPERATED_ON]-> (dateTime:DateTime) -[:RECEIVED_DATA]-> (tweet:Data { type: "tweet" }) -[:RECEIVED_MEASUREMENT]-> (sentiment:Sentiment)
        WITH dateTime, tweet, sentiment
        ORDER BY dateTime.value DESC
        RETURN apoc.date.format(dateTime.value.epochMillis, 'ms', "yyyy-MM-dd'T'HH:mm:ss'Z'") as utcDateTime, collect(tweet) as tweets, avg(sentiment.comparative) as comparativeAvg
        LIMIT 1
      `,
      {
        entityName: economicEntity.name,
        entityType: economicEntity.type,
      }
    );

    console.log(
      `
      Aggregated query sentiments:
      ${JSON.stringify(databaseData)}
      `
    );

    const datas = this._reduceSentimentGraph(databaseData);

    console.log(
      `
      Most recent sentiments:
      ${JSON.stringify(datas)}
      `
    );

    return datas;
  }

  /**
   * Reduce database sentiment graph.
   *
   * @param {Object} databaseData Data returned from the database query.
   * @return {Array<Object>} Reduced data or [].
   */
  _reduceSentimentGraph(databaseData) {
    const results = [];
    for (const record of databaseData.records) {
      results.push(
        Object.freeze({
          utcDateTime: record._fields[record._fieldLookup.utcDateTime],
          comparative: record._fields[record._fieldLookup.comparativeAvg],
          tweets: record._fields[record._fieldLookup.tweets].map(
            (tweetNode) => ({
              text: tweetNode.properties.value,
            })
          ),
        })
      );
    }

    return results;
  }

  /**
   * Add sentiment and tweet to neo4j.
   * @param {Object} economicEntity Object of form { name: <name>, type: <type> }. I.e, { name: 'Google', type: 'BUSINESS' }.
   * @param {String} utcDateTime UTC date time string.
   * @param {Object} data Object of the form { tweet: <tweet>, sentiment: <sentiment> }
   */
  async _addSentiment(economicEntity, utcDateTime, data) {
    if (!validEconomicEntities([economicEntity])) {
      throw new Error(
        `Invalid economic entity received:\n${JSON.stringify(economicEntity)}`
      );
    }

    if (!validDate(utcDateTime)) {
      throw new Error(
        `A UTC date time must be included. Received ${utcDateTime}`
      );
    }

    if (
      Object.keys(data).length <= 0 ||
      !data.tweet ||
      Object.keys(data.sentiment).length <= 0
    ) {
      throw new Error(
        `Invalid data received. tweet and sentiment are required fields. Received: ${JSON.stringify(
          data
        )}`
      );
    }

    if (Number.isNaN(data.sentiment.comparative)) {
      throw new TypeError(
        `${data.sentiment.comparative} is an invalid sentiment comparative score. A number is required.`
      );
    }

    await this.run(
      `
      MATCH (economicEntity:EconomicEntity { name: $entityName, type: $entityType})
      MATCH (economicEntity) -[:OPERATED_ON]-> (dateTime:DateTime { value: datetime($utcDateTime) })
      MERGE (dateTime) -[:RECEIVED_DATA]-> (data:Data { type: "tweet", value: $tweet })
      MERGE (data) -[:RECEIVED_MEASUREMENT]-> (:Sentiment { comparative: $comparative })
    `,
      {
        entityName: economicEntity.name,
        entityType: economicEntity.type,
        utcDateTime,
        tweet: data.tweet,
        comparative: data.sentiment.comparative,
      },
      this.neo4j.session.WRITE
    );
  }

  /**
   * Add the specified economic entity to neo4j.
   * @param {Object} economicEntity Entity of the form { name: <entity name>, type: <entity type> }, i.e, { name: 'Google', type: 'BUSINESS' }.
   */
  async _addEconomicEntity(economicEntity) {
    if (!validEconomicEntities([economicEntity])) {
      throw new Error(
        `Invalid economic entity received:\n${JSON.stringify(economicEntity)}`
      );
    }

    await this.run(
      `
      MERGE (:EconomicEntity { name: $entityName, type: $entityType})
    `,
      {
        entityName: economicEntity.name,
        entityType: economicEntity.type,
      },
      this.neo4j.session.WRITE
    );
  }

  /**
   * Add a timeline.
   * @param {Object} economicEntity Economic entity { name: <name>, type: <type> }. I.e, { name: 'Google', type: 'BUSINESS' }.
   * @param {String} utcDateTime UTC date time string.
   */
  async _addDateToEconomicEntity(economicEntity, utcDateTime) {
    if (!validDate(utcDateTime)) {
      throw new Error(
        `A UTC date time must be included. Received ${utcDateTime}`
      );
    }

    if (!validEconomicEntities([economicEntity])) {
      throw new Error(
        `Invalid economic entity received:\n${JSON.stringify(economicEntity)}`
      );
    }

    await this.run(
      `
      MATCH (economicEntity:EconomicEntity { name: $entityName, type: $entityType})
      MERGE (economicEntity) -[:OPERATED_ON]-> (:DateTime { value: datetime($utcDateTime) })
    `,
      {
        entityName: economicEntity.name,
        entityType: economicEntity.type,
        utcDateTime,
      },
      this.neo4j.session.WRITE
    );
  }
}

export {Neo4jStore};
