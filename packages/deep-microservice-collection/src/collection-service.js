import {K8sCronJob} from './command/k8s-cron-job.js';
import {K8sJob} from './command/k8s-job.js';
import {validString} from './helpers.js';
import {Operations} from './operation/operations.js';
import {hasReadAllAccess} from './permissions.js';

/**
 * Service handling data collection activity.
 */
class CollectionService {
  /**
   * Business layer associated with data collection.
   *
   * @param {Object} tweetStore - MongoDataSource tied to the tweet collection.
   * @param {Object} economicEntityMemo - EconomicEntityMemo object to be used.
   * @param {Object} commander - Commander object to be used.
   * @param {Object} admin - KafkaJS admin.
   * @param {Object} producer - KafkaJS producer to use.
   * @param {Object} applicationConsumer - KafkaJS consumer to use for application-related consuming tasks.
   * @param {Object} microserviceSyncConsumer - KafkaJS consumer to use for syncing microservice replicas.
   * @param {K8sClient} k8sClient - K8s client to use.
   * @param {Object} logger - Logger to use.
   */
  constructor(
    tweetStore,
    economicEntityMemo,
    commander,
    admin,
    producer,
    applicationConsumer,
    microserviceSyncConsumer,
    k8sClient,
    logger
  ) {
    this._tweetStore = tweetStore;
    this._economicEntityMemo = economicEntityMemo;
    this._commander = commander;
    this._admin = admin;
    this._producer = producer;
    this._applicationConsumer = applicationConsumer;
    this._microserviceSyncConsumer = microserviceSyncConsumer;
    this._k8sClient = k8sClient;
    this._logger = logger;

    this._topicCreation([
      {
        topic: 'TWEETS_COLLECTED',
        replicationFactor: 1,
      },
      {
        topic: 'TWEETS_FETCHED',
        replicationFactor: 1,
      },
      {
        topic: 'DATA_COLLECTION_STARTED',
        replicationFactor: 1,
      },
    ])
      .then(async () => {
        await this._microserviceSyncConsumer.subscribe({
          topic: 'DATA_COLLECTION_STARTED',
          // fromBeginning: true,
        });

        await this._microserviceSyncConsumer.run({
          eachMessage: async ({message}) => {
            const {economicEntityName, economicEntityType} = JSON.parse(
              message.value.toString()
            );
            this._logger.info(
              `Kafka message received. Starting data collection for ${economicEntityType} ${economicEntityName}.`
            );
            await this._startDataCollection(
              economicEntityName,
              economicEntityType
            );
          },
        });

        await this._applicationConsumer.subscribe({
          topic: 'TWEETS_FETCHED',
          fromBeginning: true,
        });

        await this._applicationConsumer.run({
          eachMessage: async ({message}) => {
            this._logger.debug(
              `Received kafka message: ${message.value.toString()}`
            );

            const {
              utcDateTime,
              economicEntityName,
              economicEntityType,
              tweets,
            } = JSON.parse(message.value.toString());
            await this._handleTweetsFetched(
              utcDateTime,
              economicEntityName,
              economicEntityType,
              tweets
            );
          },
        });

        const economicEntities =
          await this._economicEntityMemo.readEconomicEntities();
        for (const economicEntity of economicEntities) {
          this._logger.info(
            `Starting data collection for ${economicEntity.type} ${economicEntity.name}`
          );
          await this._startDataCollection(
            economicEntity.name,
            economicEntity.type
          );
        }
      })
      .catch((reason) => {
        this._logger.error(
          `An error occurred while constructing the collection service: ${JSON.stringify(
            reason
          )}`
        );
      });
  }

  /**
   * Begin data collection related to the specified entity name and type.
   * @param {String} entityName - Name of the economic entity (i.e, 'Google').
   * @param {String} entityType - Type of the economic entity (i.e, 'BUSINESS').
   * @param {Object} permissions - Permissions for the user making the request.
   * @return {Object}
   */
  async collectEconomicData(entityName, entityType, permissions) {
    if (!validString(entityName)) return {success: false};

    if (!validString(entityType)) return {success: false};

    if (!hasReadAllAccess(permissions)) return {success: false};

    this._logger.debug(
      `Collecting economic data for name: ${entityName}, type: ${entityType}`
    );

    const collectingData = await this._economicEntityMemo.collectingData(
      entityName,
      entityType
    );

    if (!collectingData) {
      await this._startDataCollection(entityName, entityType);

      await this._economicEntityMemo.memoizeDataCollection(
        entityName,
        entityType
      );

      await this._emit('DATA_COLLECTION_STARTED', {
        economicEntityName: entityName,
        economicEntityType: entityType,
      });
    }

    return {success: true};
  }

  /**
   * Get the tweets associated with the specified economic entity name and type.
   * @param {String} economicEntityName - Name of the economic entity (i.e, 'Google').
   * @param {String} economicEntityType - Type of the economic entity (i.e, 'BUSINESS').
   * @param {Object} permissions - Permissions for the user making the request.
   * @return {Array} - Tweets that are in the database or [].
   */
  async tweets(economicEntityName, economicEntityType, permissions) {
    if (!validString(economicEntityName)) return [];

    if (!validString(economicEntityType)) return [];

    if (!hasReadAllAccess(permissions)) return [];

    this._logger.debug(
      `Fetching tweets for economic entity name ${economicEntityName}, type ${economicEntityType}`
    );

    return this._tweetStore.readRecentTweets(
      economicEntityName,
      economicEntityType,
      10
    );
  }

  /**
   * Start data collection for the specified entity name and type.
   * @param {String} entityName - Name of the economic entity (i.e, 'Google')
   * @param {String} entityType - Type of the economic entity (i.e, 'BUSINESS')
   */
  async _startDataCollection(entityName, entityType) {
    if (!validString(entityName)) return;

    if (!validString(entityType)) return;

    const key = `${entityName}:${entityType}`;
    if (this._commander.registered(key)) return;

    this._logger.info(`Executing commands for ${entityName}, ${entityType}`);

    const commands = this._commands(entityName, entityType);

    await this._commander.execute(key, commands);
  }

  /**
   * Fetch the commands associated with the economic entity type.
   * @param {String} entityName - Name of the economic entity (i.e, 'Google').
   * @param {String} entityType - Economic entity type (i.e, 'BUSINESS').
   * @return {Array} - Array of command objects to execute for data collection.
   */
  _commands(entityName, entityType) {
    const type = entityType.toLowerCase();
    if (type === 'business') {
      const namespace = process.env.NAMESPACE;
      if (!namespace) {
        throw new Error(
          `A namespace in which to run jobs and cronjobs is required. Received: ${namespace}`
        );
      }

      const kababCaseName = entityName.toLowerCase().split(' ').join('-');
      const kababCaseType = entityType.toLowerCase().split(' ').join('-');
      const name = `fetch-tweets-${kababCaseName}-${kababCaseType}`;

      const fetchTweets = Operations.FetchTweets(entityName, entityType);

      const fetchTweetsOnSchedule = new K8sCronJob(
        {
          name,
          namespace,
          /**
           * Time interval between each twitter API call.
           *
           * NOTE: Due to twitter developer account limitations only 500,000 tweets can be consumed per month.
           * As a result, ~400 businesses can be watched when fetched every 6 hours.
           */
          /** min | hour | day | month | weekday */
          schedule: `0 */6 * * *`,
          operation: fetchTweets,
        },
        this._k8sClient,
        this._logger
      );

      const fetchTweetsImmediately = new K8sJob(
        {
          name,
          namespace,
          operation: fetchTweets,
        },
        this._k8sClient,
        this._logger
      );

      return [fetchTweetsOnSchedule, fetchTweetsImmediately];
    } else {
      throw new Error('The specified economic type was unknown.');
    }
  }

  /**
   * Handle the tweets fetched event.
   * @param {String} utcDateTime UTC date time.
   * @param {String} entityName Economic entity name (i.e, 'Google').
   * @param {String} entityType Economic entity type (i.e, 'BUSINESS').
   * @param {Array} tweets Array of tweet objects of the form { text: '...' }.
   */
  async _handleTweetsFetched(utcDateTime, entityName, entityType, tweets) {
    if (!validString(entityName)) return false;

    if (!validString(entityType)) return false;

    if (!Array.isArray(tweets) || tweets.length === 0) return false;

    this._logger.info(
      `Adding timeseries entry to tweet store with date ${utcDateTime}, tweets ${JSON.stringify(
        tweets
      )}`
    );

    const created = await this._tweetStore.createTweets(
      utcDateTime,
      entityName,
      entityType,
      tweets
    );

    if (!created) {
      throw new Error(`Failed to create tweets.`);
    }

    const mostRecentData = await this._tweetStore.readRecentTweets(
      entityName,
      entityType,
      1
    );

    const event = {
      economicEntityName: entityName,
      economicEntityType: entityType,
      timeSeriesItems: mostRecentData,
    };

    this._logger.info(
      `Adding collection event with value: ${JSON.stringify(event)}`
    );

    await this._emit('TWEETS_COLLECTED', event);
  }

  /**
   * Create the specified topics.
   *
   * @param {Array} topics - String array consisting of topic names.
   */
  async _topicCreation(topics) {
    try {
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
        )}, message: message: ${error.message.toString()}`
      );
    }
  }

  /**
   * Emit an event.
   * @param {String} eventName Name of the event to emit.
   * @param {Object} event Event data.
   */
  async _emit(eventName, event) {
    await this._producer.send({
      topic: eventName,
      messages: [{value: JSON.stringify(event)}],
    });
  }
}

export {CollectionService};
