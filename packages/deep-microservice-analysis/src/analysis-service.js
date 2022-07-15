import {attachExitHandler} from '@thinkdeep/attach-exit-handler';
import {hasReadAllAccess} from './permissions.js';

/**
 * Service that applies business logic to data analysis operations for the application.
 */
class AnalysisService {
  /**
   * Business layer for analysis operations.
   *
   * NOTE: The parameters below are injected because that improves testability of the codebase.
   *
   * @param {Object} mongoDataStore - MongoDB data store to use.
   * @param {Object} neo4jDataStore - Neo4j data store to use.
   * @param {Object} sentimentLib - Library to use for sentiment analysis. This is an instance of Sentiment from 'sentiment' package.
   * @param {Object} kafkaClient - KafkaJS client to use.
   * @param {Object} logger - Logger to use.
   */
  constructor(
    mongoDataStore,
    neo4jDataStore,
    sentimentLib,
    kafkaClient,
    logger
  ) {
    this._mongoDataStore = mongoDataStore;
    this._neo4jDataStore = neo4jDataStore;
    this._sentimentLib = sentimentLib;
    this._kafkaClient = kafkaClient;

    this._admin = this._kafkaClient.admin();
    this._consumer = this._kafkaClient.consumer({
      groupId: 'deep-microservice-analysis-consumer',
    });
    this._producer = this._kafkaClient.producer();

    this._logger = logger;
  }

  /**
   * Connect the analysis service to underlying support systems.
   */
  async connect() {
    this._logger.info(`Connecting to analysis service support systems.`);

    await attachExitHandler(async () => {
      this._logger.info('Cleaning up kafka connections.');
      await this._admin.disconnect();
      await this._consumer.disconnect();
      await this._producer.disconnect();
    });

    this._logger.info('Connecting to Kafka.');
    await this._admin.connect();
    await this._consumer.connect();
    await this._producer.connect();

    await this._topicCreation([
      {topic: 'TWEETS_COLLECTED', replicationFactor: 1},
      {topic: 'TWEET_SENTIMENT_COMPUTED', replicationFactor: 1},
    ]);

    this._logger.info(`Subscribing to TWEETS_COLLECTED topic`);
    await this._consumer.subscribe({
      topic: 'TWEETS_COLLECTED',
      fromBeginning: true,
    });

    this._logger.info(`Running consumer handlers on each message.`);
    await this._consumer.run({
      eachMessage: async ({message}) => {
        this._logger.debug(
          `Received kafka message: ${message.value.toString()}`
        );

        const {economicEntityName, economicEntityType, timeSeriesItems} =
          JSON.parse(message.value.toString());
        await this._computeSentiment(
          economicEntityName,
          economicEntityType,
          timeSeriesItems
        );
      },
    });
  }

  /**
   * Get the sentiments associated with the specified economic entity and type.
   *
   * @param {Array<Object>} economicEntities Array of objects of the form { name: <some business name>, type: <some entity type> }.
   * @param {String} startDate UTC date time.
   * @param {String} endDate UTC date time.
   * @param {Object} permissions Permissions for the user making the request.
   * @return {Array} The formatted sentiment objects in array form or [].
   */
  async sentiments(economicEntities, startDate, endDate, permissions) {
    if (!hasReadAllAccess(permissions)) return [];

    // TODO: Input validation

    const results = [];
    for (const economicEntity of economicEntities) {
      this._logger.info(
        `Querying sentiments for ${economicEntity.type} ${economicEntity.name}.`
      );

      results.push(
        await this._sentimentData(economicEntity, startDate, endDate)
      );
    }

    this._logger.debug(`Sentiments read: ${JSON.stringify(results)}`);

    return results;
  }

  /**
   * Get the sentiment.
   * @param {Object} economicEntity Object of the form { name: <entity name>, type: <entity type> }.
   * @param {String} startDate UTC date time.
   * @param {String} endDate UTC date time.
   * @return {Object} Sentiment data.
   */
  async _sentimentData(economicEntity, startDate, endDate) {
    // TODO: Input validity.

    return this._neo4jDataStore.readSentiment(
      economicEntity,
      startDate,
      endDate
    );
  }

  /**
   * Read the most recent sentiments.
   * @param {Array<Object>} economicEntities
   */
  async _mostRecentSentiments(economicEntities) {
    const results = [];
    for (const economicEntity of economicEntities) {
      this._logger.debug(
        `Reading most recent sentiment for ${economicEntity.type} ${economicEntity.name}.`
      );

      results.push(
        await this._neo4jDataStore.readMostRecentSentiment(economicEntity)
      );
    }

    this._logger.debug(`

      Sentiment values read: ${JSON.stringify(results)}

    `);

    return results;
  }

  /**
   * Compute sentiments for the specified tweets.
   *
   * NOTE: This sends a kafka event after sentiment computation.
   *
   * @param {String} economicEntityName Name of the economic entity (i.e, Google)
   * @param {String} economicEntityType Type of economic entity (i.e, BUSINESS)
   * @param {Array} datas Consists of objects of the form [{ utcDateTime: <Number>, tweets: [{ text: 'tweet text' }]}]
   */
  async _computeSentiment(economicEntityName, economicEntityType, datas) {
    const economicEntity = {
      name: economicEntityName,
      type: economicEntityType,
    };

    for (const data of datas) {
      for (const tweet of data.tweets) {
        const text = tweet.text || '';

        if (!text) continue;

        this._logger.info(
          `
          Adding sentiment to graph for ${economicEntityType} ${economicEntityName}
          tweet ${text}
          received ${data.utcDateTime}
          `
        );

        await this._neo4jDataStore.addSentiments(economicEntity, [
          {
            utcDateTime: data.utcDateTime,
            tweet: text,
            sentiment: this._sentiment(text),
          },
        ]);
      }
    }

    const mostRecentData = await this._mostRecentSentiments([
      economicEntity,
    ])[0];

    const event = {
      economicEntityName,
      economicEntityType,
      data: mostRecentData,
    };

    // TODO: Rename TWEET_SENTIMENT_COMPUTED to SENTIMENT_UPDATED.
    const eventName = 'TWEET_SENTIMENT_COMPUTED';

    this._logger.info(
      `Emitting event ${eventName} with data ${JSON.stringify(event)}`
    );
    await this._emit(eventName, event);
  }

  /**
   * Compute the sentiment.
   * @param {String} text Subject of the computation.
   * @return {Object} Sentiment object of the form { score: <number>, comparative: <number>, ...}.
   */
  _sentiment(text) {
    return this._sentimentLib.analyze(text.toLowerCase());
  }

  /**
   * Create the specified topics.
   *
   * @param {Array} topics - String array consisting of topic names.
   */
  async _topicCreation(topics) {
    try {
      this._logger.info(`Creating topics ${JSON.stringify(topics)}`);
      await this._admin.createTopics({
        /**
         * NOTE: If you don't wait for leaders the system throws an error when trying to write to the topic if a leader
         * hasn't been selected.
         */
        waitForLeaders: true,
        topics,
      });
    } catch (error) {
      /** An error is thrown when the topic has already been created */
      this._logger.warn(
        `Creation of topics ${JSON.stringify(
          topics
        )} exited with error: ${JSON.stringify(
          error
        )}, message: ${error.message.toString()}`
      );
    }
  }

  /**
   * Emit a particular kafka event.
   * @param {String} eventName - Name of the event.
   * @param {Object} data - Event data to transmit.
   */
  async _emit(eventName, data) {
    this._logger.debug(`Emitting ${eventName}`);
    await this._producer.send({
      topic: eventName,
      messages: [{value: JSON.stringify(data)}],
    });
  }
}

export {AnalysisService};
