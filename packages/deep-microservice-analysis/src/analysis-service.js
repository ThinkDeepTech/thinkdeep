import {attachExitHandler} from '@thinkdeep/attach-exit-handler';
import {EconomicEntityFactory, validEconomicEntities} from '@thinkdeep/model';
import {validDate, validString} from '@thinkdeep/util';
import {hasReadAllAccess} from './permissions.js';

/**
 * Determine if a value is a valid end date.
 * @param {any} val
 * @return {Boolean} True if valid. False otherwise.
 */
const validEndDate = (val) => {
  return val === null || validDate(val);
};

/**
 * Service that applies business logic to data analysis operations for the application.
 */
class AnalysisService {
  /**
   * Business layer for analysis operations.
   *
   * NOTE: The parameters below are injected because that improves testability of the codebase.
   *
   * @param {Object} neo4jDataStore - Neo4j data store to use.
   * @param {Object} sentimentLib - Library to use for sentiment analysis. This is an instance of Sentiment from 'sentiment' package.
   * @param {Object} kafkaClient - KafkaJS client to use.
   * @param {Object} logger - Logger to use.
   */
  constructor(neo4jDataStore, sentimentLib, kafkaClient, logger) {
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
      {topic: 'SENTIMENT_COMPUTED', replicationFactor: 1},
    ]);

    this._logger.debug(`Subscribing to TWEETS_COLLECTED topic`);
    await this._consumer.subscribe({
      topic: 'TWEETS_COLLECTED',
    });

    this._logger.debug(`Running consumer handlers on each message.`);
    await this._consumer.run({
      eachMessage: async ({message}) => {
        this._logger.debug(
          `Received kafka message: ${message.value.toString()}`
        );

        const eventData = JSON.parse(message.value.toString());

        const economicEntity = EconomicEntityFactory.economicEntity(
          eventData.economicEntity
        );
        const timeSeriesItems = eventData.timeSeriesItems;

        await this._computeSentiment(economicEntity, timeSeriesItems);
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
    if (!validEconomicEntities(economicEntities)) {
      throw new Error(`An invalid economic entity was received.`);
    }

    if (!validDate(startDate)) {
      throw new Error(`The start date ${startDate} is invalid.`);
    }

    if (!validEndDate(endDate)) {
      throw new Error(`The end date ${endDate} is invalid.`);
    }

    // TODO: Move access checks to separate project.
    if (!hasReadAllAccess(permissions)) return [];

    const results = [];
    for (const economicEntity of economicEntities) {
      this._logger.info(
        `Querying sentiments for ${economicEntity.type} ${economicEntity.name}.`
      );

      results.push(
        await this._sentimentData(economicEntity, startDate, endDate)
      );
    }

    return results;
  }

  /**
   * Get the sentiment.
   * @param {Object} economicEntity Object of the form { name: <entity name>, type: <entity type> }.
   * @param {String} startDate UTC date time.
   * @param {String | null} endDate UTC date time.
   * @return {Object} Sentiment data.
   */
  async _sentimentData(economicEntity, startDate, endDate) {
    if (!validEconomicEntities([economicEntity])) {
      throw new Error(`An invalid economic entity was received.`);
    }

    if (!validDate(startDate)) {
      throw new Error(`The start date ${startDate} is invalid.`);
    }

    if (!validEndDate(endDate)) {
      throw new Error(`The end date ${endDate} is invalid.`);
    }

    return this._neo4jDataStore.readSentiments(
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
    if (!validEconomicEntities(economicEntities)) {
      throw new Error(`An invalid economic entity was received.`);
    }

    const results = [];
    for (const economicEntity of economicEntities) {
      this._logger.debug(
        `Reading most recent sentiment for ${economicEntity.type} ${economicEntity.name}.`
      );

      results.push(
        await this._neo4jDataStore.readMostRecentSentiment(economicEntity)
      );
    }

    return results;
  }

  /**
   * Compute sentiment.
   *
   * NOTE: This sends a kafka event after sentiment computation.
   *
   * @param {Object} economicEntity Economic entity object.
   * @param {Array} datas Consists of objects of the form [{ utcDateTime: <Number>, tweets: [{ text: 'tweet text' }]}]
   */
  async _computeSentiment(economicEntity, datas) {
    if (!validEconomicEntities([economicEntity])) {
      throw new Error(`An invalid economic entity was received.`);
    }

    for (const data of datas) {
      for (const tweet of data.tweets) {
        const text = tweet.text || '';

        if (!text) continue;

        const sentiment = this._sentiment(text);

        this._logger.info(
          `
          Adding sentiment to graph for ${economicEntity.type} ${economicEntity.name}
          tweet ${text}
          comparative sentament ${sentiment.comparative}
          received ${data.utcDateTime}
          `
        );

        await this._neo4jDataStore.addSentiments(economicEntity, [
          {
            utcDateTime: data.utcDateTime,
            tweet: text,
            sentiment,
          },
        ]);
      }
    }

    const mostRecentSentiment = (
      await this._mostRecentSentiments([economicEntity])
    )[0][0];

    this._logger.debug(
      `Most recent data received\n${JSON.stringify(mostRecentSentiment)}`
    );

    const event = {
      economicEntity,
      data: mostRecentSentiment,
    };

    const eventName = 'SENTIMENT_COMPUTED';

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
    if (!validString(text)) {
      throw new Error(`The value ${text} is invalid.`);
    }

    return this._sentimentLib.analyze(text.toLowerCase());
  }

  /**
   * Create the specified topics.
   *
   * @param {Array<Object>} topics - Array consisting of topic objects from kafkajs.
   */
  async _topicCreation(topics) {
    if (!topics || !Array.isArray(topics) || topics.length <= 0) {
      throw new Error(`Valid topics are required.`);
    }

    try {
      this._logger.debug(`Creating topics ${JSON.stringify(topics)}`);
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
    if (!validString(eventName)) {
      throw new Error(`The event name ${eventName} is invalid.`);
    }

    this._logger.debug(`Emitting ${eventName}`);
    await this._producer.send({
      topic: eventName,
      messages: [{value: JSON.stringify(data)}],
    });
  }
}

export {AnalysisService};
