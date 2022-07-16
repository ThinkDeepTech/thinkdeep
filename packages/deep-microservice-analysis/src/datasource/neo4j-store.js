import {Neo4jDataSource} from '@thinkdeep/apollo-datasource-neo4j';

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

    for (const data of datas) {
      if (!data.utcDateTime) {
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
   * Read the sentiment.
   * @param {Object} economicEntity Subject for which sentiment will be read.
   * @param {String} startDate UTC date time.
   * @param {String} endDate UTC date time.
   * @return {Object} Sentiment.
   */
  async readSentiment(economicEntity, startDate, endDate) {
    const databaseDatas = await this.run(
      `
        MATCH (:EconomicEntity { name: $entityName, type: $entityType}) -[:OPERATED]-> (utcDateTime:DateTime) -[:RECEIVED_DATA]-> (tweet:Data { type: "tweet" }) -[:RECEIVED_MEASUREMENT]-> (sentiment:Sentiment)
        WHERE date($startDate) <= utcDateTime.value ${
          !endDate ? `` : `<= date($endDate)`
        }
        RETURN utcDateTime, tweet, sentiment
      `,
      {
        entityName: economicEntity.name,
        entityType: economicEntity.type,
        startDate,
        endDate,
      }
    );

    return this._reduceSentimentGraph(databaseDatas);
  }

  /**
   * Read the sentiment.
   * @param {Object} economicEntity Subject for which sentiment will be read.
   * @return {Object} Sentiment.
   */
  async readMostRecentSentiment(economicEntity) {
    const databaseDatas = await this.run(
      `
        MATCH (:EconomicEntity { name: $entityName, type: $entityType}) -[:OPERATED_ON]-> (utcDateTime:DateTime) -[:RECEIVED_DATA]-> (tweet:Data { type: "tweet" }) -[:RECEIVED_MEASUREMENT]-> (sentiment:Sentiment)
        WITH utcDateTime, tweet, sentiment
        ORDER BY utcDateTime.value DESC LIMIT 1
        RETURN utcDateTime, tweet, sentiment
      `,
      {
        entityName: economicEntity.name,
        entityType: economicEntity.type,
      }
    );

    // TODO
    // const thing =
    // [
    //   {
    //     "keys":["tweet","sentiment"],
    //     "length":2,
    //     "_fields": [
    //       {
    //         "identity":100,
    //         "labels":["Data"],
    //         "properties":{
    //           "type":"tweet",
    //           "value":"Poppy could sure use some new wheels, especially ones as cool as a new Bronco.  Thanks to Moosehead for this great sweeps.  The entry https://t.co/bpBzjfJ5rJ #sweeps #sweepstakes #contest #giveaway"
    //         }
    //       },
    //       {
    //         "identity":101,
    //         "labels":["Sentiment"],
    //         "properties":{
    //           "comparative":0.1875
    //         }
    //       }
    //     ],
    //     "_fieldLookup":{
    //       "tweet":0,
    //       "sentiment":1
    //     }
    //   }
    // ];

    const datas = this._reduceSentimentGraph(databaseDatas);

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
   * @param {Array<Object>} databaseDatas Data returned from the database query.
   * @return {Array<Object>} Reduced data or [].
   */
  _reduceSentimentGraph(databaseDatas) {
    const results = [];
    for (const dbData of databaseDatas) {
      results.push({
        utcDateTime:
          dbData._fields[dbData._fieldLookup.utcDateTime].properties.value ||
          null,
        comparative:
          dbData._fields[dbData._fieldLookup.sentiment].properties
            .comparative || null,
        text:
          dbData._fields[dbData._fieldLookup.tweet].properties.value || null,
      });
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
    if (!utcDateTime) {
      throw new Error(
        `A UTC date time must be included. Received ${utcDateTime}`
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
    if (!utcDateTime) {
      throw new Error(
        `A UTC date time must be included. Received ${utcDateTime}`
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
