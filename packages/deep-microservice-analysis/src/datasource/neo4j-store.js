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
   * @param {String} startDate UTC date time. TODO
   * @param {String} endDate UTC date time. TODO
   * @return {Object} Sentiment.
   */
  async readSentiment(economicEntity, startDate, endDate) {
    const result = await this.run(
      `
        MATCH (:EconomicEntity { name: $entityName, type: $entityType}) -[*2..2]-> (tweet:Data { type: "tweet" }) -[:RECEIVED_MEASUREMENT]-> (sentiment:Sentiment)
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

    return this._someFunction(result);
  }

  /**
   * Read the sentiment.
   * @param {Object} economicEntity Subject for which sentiment will be read.
   * @return {Object} Sentiment.
   */
  async readMostRecentSentiment(economicEntity) {
    const result = await this.run(
      `
        MATCH (:EconomicEntity { name: $entityName, type: $entityType}) -[:OPERATED_ON]-> (dateTime:DateTime) -[:RECEIVED_DATA]-> (tweet:Data { type: "tweet" }) -[:RECEIVED_MEASUREMENT]-> (sentiment:Sentiment)
        WITH dateTime, tweet, sentiment
        ORDER BY dateTime.value DESC
        WITH collect(tweet)[0] as tweet, collect(sentiment)[0] as sentiment
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

    console.log(
      `
    Most recent sentiments:
    ${JSON.stringify(result)}
    `
    );

    return result;
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

    const accessMode = this.neo4j.session.WRITE;
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

    const accessMode = this.neo4j.session.WRITE;
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
      {
        // TODO: Same as above
        database: 'neo4j',
        accessMode,
      }
    );
  }

  // _someFunction(neo4jResult) {
  //   const data =
  //   {
  //     "keys": [
  //       "tweet",
  //       "sentiment"
  //     ],
  //     "length": 2,
  //     "_fields": [
  //       {
  //         "identity": {
  //           "low": 6,
  //           "high": 0
  //         },
  //         "labels": [
  //           "Data"
  //         ],
  //         "properties": {
  //           "type": "tweet",
  //           "value": "This generation of players loves AI so much @Reebok would be STEWPID not to re-up and create a legacy slate of players inspired by how he approached the game and approached life. Everybody loves Chuck. https://t.co/NIF1yHV91X"
  //         }
  //       },
  //       {
  //         "identity": {
  //           "low": 7,
  //           "high": 0
  //         },
  //         "labels": [
  //           "Sentiment"
  //         ],
  //         "properties": {
  //           "value": 0.20512820512820512
  //         }
  //       }
  //     ],
  //     "_fieldLookup": {
  //       "tweet": 0,
  //       "sentiment": 1
  //     }
  //   };
  // }
}

export {Neo4jStore};
