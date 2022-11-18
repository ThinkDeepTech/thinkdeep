import {EconomicEntityFactory, EconomicEntityType} from '@thinkdeep/model';
import chai from 'chai';
import chaiAsPromised from 'chai-as-promised';
import {Commander} from '../src/commander.js';
import moment from 'moment';
import sinon from 'sinon';
import sinonChai from 'sinon-chai';

import {CollectionService} from '../src/collection-service.js';
import {TweetStore} from '../src/datasource/tweet-store.js';
import {EconomicEntityMemo} from '../src/datasource/economic-entity-memo.js';
const expect = chai.expect;
chai.use(sinonChai);
chai.use(chaiAsPromised);

describe('collection-service', () => {
  process.env.NAMESPACE = 'default';
  process.env.DATA_COLLECTOR_IMAGE_NAME = 'thinkdeeptech/collect-data:latest';

  const memoizedEconomicEntities = [
    EconomicEntityFactory.economicEntity({
      name: 'firstbusiness',
      type: 'BUSINESS',
    }),
    EconomicEntityFactory.economicEntity({
      name: 'secondbusiness',
      type: 'BUSINESS',
    }),
  ];

  let tweetStore;
  let economicEntityMemo;
  let commander;
  let admin;
  let producer;
  let applicationConsumer;
  let microserviceSyncConsumer;
  let k8sClient;
  let logger;
  let subject;
  beforeEach(() => {
    tweetStore = sinon.createStubInstance(TweetStore);

    tweetStore.createTweets.returns(true);

    logger = {
      debug: sinon.stub(),
      info: sinon.stub(),
      warn: sinon.stub(),
      error: sinon.stub(),
    };

    economicEntityMemo = sinon.createStubInstance(EconomicEntityMemo);

    economicEntityMemo.readEconomicEntities.returns(
      Promise.resolve(memoizedEconomicEntities)
    );
    economicEntityMemo.collectingData.returns(true);

    commander = sinon.createStubInstance(Commander);

    commander.registered.returns(false);

    admin = {
      createTopics: sinon.stub().returns(Promise.resolve()),
    };

    producer = {
      send: sinon.stub(),
    };

    applicationConsumer = {
      subscribe: sinon.stub(),
      run: sinon.stub(),
    };

    applicationConsumer.subscribe.returns(Promise.resolve());
    applicationConsumer.run.returns(Promise.resolve());

    microserviceSyncConsumer = {
      subscribe: sinon.stub(),
      run: sinon.stub(),
    };

    microserviceSyncConsumer.subscribe.returns(Promise.resolve());
    microserviceSyncConsumer.run.returns(Promise.resolve());

    subject = new CollectionService(
      tweetStore,
      economicEntityMemo,
      commander,
      admin,
      producer,
      applicationConsumer,
      microserviceSyncConsumer,
      k8sClient,
      logger
    );
  });

  afterEach(() => {
    sinon.restore();
  });

  describe('constructor', () => {
    it('should create the tweets collected and tweets fetched topics', () => {
      const args = admin.createTopics.getCall(0).args;
      const topics = args[0].topics;
      expect(topics[0].topic).to.equal('TWEETS_COLLECTED');
      expect(topics[1].topic).to.equal('TWEETS_FETCHED');
    });

    it('should subscribe to the tweets fetched event', () => {
      const args = applicationConsumer.subscribe.getCall(0).args;
      expect(args[0].topic).to.equal('TWEETS_FETCHED');
    });

    it('should process each of the tweets fetched with its handler', async () => {
      const economicEntity = EconomicEntityFactory.economicEntity({
        name: 'Google',
        type: EconomicEntityType.Business,
      });
      const message = JSON.stringify({
        utcDateTime: moment().utc().format(),
        economicEntity,
        tweets: [
          {
            text: 'tweet1',
          },
          {
            text: 'tweet2',
          },
        ],
      });

      const args = applicationConsumer.run.getCall(0).args;

      const perMessageCallback = args[0].eachMessage;

      await perMessageCallback({
        message: {
          value: {
            toString: () => message,
          },
        },
      });

      expect(tweetStore.createTweets.callCount).to.be.greaterThan(0);
    });

    it('should read all of the economic entities stored', () => {
      expect(economicEntityMemo.readEconomicEntities.callCount).to.equal(1);
    });

    it('should collect data for each memoized economic entity', () => {
      const firstCall = commander.execute.getCall(0);
      const secondCall = commander.execute.getCall(1);

      const firstEconomicEntity = memoizedEconomicEntities[0];
      const secondEconomicEntity = memoizedEconomicEntities[1];
      expect(firstCall.args[0]).to.equal(
        `${firstEconomicEntity.type}:${firstEconomicEntity.name}`
      );
      expect(secondCall.args[0]).to.equal(
        `${secondEconomicEntity.type}:${secondEconomicEntity.name}`
      );
    });
  });

  describe('collectEconomicData', () => {
    it('should indicate failure if an invalid economic entity is supplied', async () => {
      const economicEntity = {
        name: 'Google',
        type: EconomicEntityType.Business,
      };
      const permissions = {scope: 'read:all'};
      await expect(
        subject.collectEconomicData([economicEntity], permissions)
      ).to.be.rejectedWith(Error);
    });

    it('should indicate failure if the read:all scope is absent from the permissions', async () => {
      const economicEntity = EconomicEntityFactory.economicEntity({
        name: 'Google',
        type: EconomicEntityType.Business,
      });
      const permissions = {scope: 'email profile'};
      const result = await subject.collectEconomicData(
        [economicEntity],
        permissions
      );
      expect(result.success).to.equal(false);
    });

    it('should indicate failure if a permissions object is not supplied', async () => {
      const economicEntity = EconomicEntityFactory.economicEntity({
        name: 'Google',
        type: EconomicEntityType.Business,
      });
      const result = await subject.collectEconomicData(
        [economicEntity],
        undefined
      );
      expect(result.success).to.equal(false);
    });

    it('should execute the body if the permissions has read:all scope', async () => {
      const economicEntity = EconomicEntityFactory.economicEntity({
        name: 'Google',
        type: EconomicEntityType.Business,
      });
      const permissions = {scope: 'read:all'};

      economicEntityMemo.collectingData.returns(true);

      const result = await subject.collectEconomicData(
        [economicEntity],
        permissions
      );
      expect(result.success).to.equal(true);
    });

    it('should not collect data if data is already being collected', async () => {
      const economicEntity = EconomicEntityFactory.economicEntity({
        name: 'Google',
        type: EconomicEntityType.Business,
      });
      const permissions = {scope: 'read:all'};

      economicEntityMemo.collectingData.returns(true);

      await subject.collectEconomicData([economicEntity], permissions);
      expect(economicEntityMemo.memoizeDataCollection.callCount).to.equal(0);
    });

    it('should collect data if data is not being collected', async () => {
      const economicEntity = EconomicEntityFactory.economicEntity({
        name: 'Google',
        type: EconomicEntityType.Business,
      });
      const permissions = {scope: 'read:all'};

      economicEntityMemo.collectingData.returns(false);

      await subject.collectEconomicData([economicEntity], permissions);

      // NOTE: The constructor also starts collection of data. Therefore, it's accounted for here.
      const executionKey = commander.execute.getCall(
        memoizedEconomicEntities.length
      ).args[0];

      // NOTE: The constructor executes the execute command twice. So, here, we need that plus one.
      expect(commander.execute.callCount).to.be.greaterThanOrEqual(
        memoizedEconomicEntities.length + 1
      );
      expect(executionKey).to.equal(
        `${economicEntity.type}:${economicEntity.name}`
      );
    });
  });

  describe('_startDataCollection', () => {
    it('should indicate failure if the economic entity supplied is invalid', async () => {
      const economicEntity = {name: 'Google', type: 'GOOGLE'};
      await expect(
        subject._startDataCollection(economicEntity)
      ).to.be.rejectedWith(Error);
    });

    it('should start collection of data', async () => {
      const economicEntity = EconomicEntityFactory.economicEntity({
        name: 'Google',
        type: EconomicEntityType.Business,
      });

      await subject._startDataCollection(economicEntity);

      const key = commander.execute.getCall(memoizedEconomicEntities.length)
        .args[0];
      expect(commander.execute.callCount).to.equal(
        memoizedEconomicEntities.length + 1
      );
      expect(key).to.equal(`${economicEntity.type}:${economicEntity.name}`);
    });
  });

  describe('_commands', () => {
    it('should indicate failure if the economic entity supplied is invalid', () => {
      const economicEntity = {name: 'Google', type: 'GOOGLE'};
      expect(() => subject._commands(economicEntity)).to.throw(Error);
    });

    it(`should include a repetative command to collect tweets for type ${EconomicEntityType.Business}`, () => {
      const economicEntity = EconomicEntityFactory.economicEntity({
        name: 'Google',
        type: EconomicEntityType.Business,
      });
      const commands = subject._commands(economicEntity);
      const classObj = commands[0];

      expect(classObj.constructor.name).to.equal('K8sCronJob');
    });

    it(`should include a command to collect tweets for type ${EconomicEntityType.Business} immediately`, () => {
      const economicEntity = EconomicEntityFactory.economicEntity({
        name: 'Google',
        type: EconomicEntityType.Business,
      });
      const commands = subject._commands(economicEntity);
      const classObj = commands[1];

      expect(classObj.constructor.name).to.equal('K8sJob');
    });
  });

  describe('_handleTweetsFetched', () => {
    it('should indicate failure if the economic entity supplied is invalid', async () => {
      const utcDateTime = moment().utc().format();
      const economicEntity = {name: 'Google', type: 'GOOGLE'};
      const tweets = [
        {
          text: 'sometweet',
        },
        {
          text: 'another tweet',
        },
      ];
      await expect(
        subject._handleTweetsFetched(utcDateTime, economicEntity, tweets)
      ).to.be.rejectedWith(Error);
    });

    it('should indicate failure if the date supplied is invalid', async () => {
      const utcDateTime = '1G';
      const economicEntity = EconomicEntityFactory.economicEntity({
        name: 'Google',
        type: EconomicEntityType.Business,
      });
      const tweets = [
        {
          text: 'sometweet',
        },
        {
          text: 'another tweet',
        },
      ];
      await expect(
        subject._handleTweetsFetched(utcDateTime, economicEntity, tweets)
      ).to.be.rejectedWith(Error);
    });

    it('should do nothing if tweets is empty', async () => {
      const utcDateTime = moment().utc().format();
      const economicEntity = EconomicEntityFactory.economicEntity({
        name: 'Google',
        type: EconomicEntityType.Business,
      });
      const tweets = [];

      await subject._handleTweetsFetched(utcDateTime, economicEntity, tweets);

      expect(tweetStore.createTweets.callCount).to.be.lessThanOrEqual(0);
    });

    it('should do nothing if tweets is not defined', async () => {
      const utcDateTime = moment().utc().format();
      const economicEntity = EconomicEntityFactory.economicEntity({
        name: 'Google',
        type: EconomicEntityType.Business,
      });

      await subject._handleTweetsFetched(
        utcDateTime,
        economicEntity,
        undefined
      );

      expect(tweetStore.createTweets.callCount).to.be.lessThanOrEqual(0);
    });

    it('should store the tweets', async () => {
      const utcDateTime = moment().utc().format();
      const economicEntity = EconomicEntityFactory.economicEntity({
        name: 'Google',
        type: EconomicEntityType.Business,
      });
      const tweets = [
        {
          text: 'sometweet',
        },
        {
          text: 'another tweet',
        },
      ];

      tweetStore.createTweets.returns(true);

      await subject._handleTweetsFetched(utcDateTime, economicEntity, tweets);

      expect(tweetStore.createTweets.callCount).to.be.greaterThan(0);
    });

    it('should wait for topic creation before adding to the message queue', async () => {
      const utcDateTime = moment().utc().format();
      const economicEntity = EconomicEntityFactory.economicEntity({
        name: 'Google',
        type: EconomicEntityType.Business,
      });
      const tweets = [
        {
          text: 'sometweet',
        },
        {
          text: 'another tweet',
        },
      ];

      tweetStore.createTweets.returns(true);

      const timeSeriesData = [
        {
          utcDateTime,
          economicEntity,
          tweets,
        },
      ];

      tweetStore.readRecentTweets.returns(timeSeriesData);

      await subject._handleTweetsFetched(utcDateTime, economicEntity, tweets);

      const adminArg = admin.createTopics.getCall(0).args[0];
      expect(admin.createTopics.callCount).to.equal(1);
      expect(adminArg.waitForLeaders).to.equal(true);
    });

    it('should add a message to the queue indicating what tweets were collected', async () => {
      const utcDateTime = moment().utc().format();
      const economicEntity = EconomicEntityFactory.economicEntity({
        name: 'Google',
        type: EconomicEntityType.Business,
      });
      const tweets = [
        {
          text: 'sometweet',
        },
        {
          text: 'another tweet',
        },
      ];

      tweetStore.createTweets.returns(true);

      const timeSeriesData = [
        {
          utcDateTime,
          economicEntity,
          tweets,
        },
      ];

      tweetStore.readRecentTweets.returns(timeSeriesData);

      await subject._handleTweetsFetched(utcDateTime, economicEntity, tweets);

      const sendArg = producer.send.getCall(0).args[0];
      const sentEvent = JSON.parse(sendArg.messages[0].value);
      expect(sendArg.topic).to.equal('TWEETS_COLLECTED');
      expect(sentEvent.economicEntity.name).to.equal(economicEntity.name);
      expect(sentEvent.economicEntity.type).to.equal(economicEntity.type);

      const eventTweets = sentEvent.timeSeriesItems[0].tweets;
      expect(eventTweets[0].text).to.equal(tweets[0].text);
      expect(eventTweets[1].text).to.equal(tweets[1].text);
    });
  });

  describe('_topicCreation', () => {
    it('should wait for a leader selection before returning', async () => {
      const topics = ['SOME_TOPIC'];

      await subject._topicCreation(topics);

      const options = admin.createTopics.getCall(0).args[0];
      expect(options.waitForLeaders).to.equal(true);
    });

    it('should warn the user when an error occurs', async () => {
      const topics = ['SOME_TOPIC'];

      admin.createTopics.throws();

      await subject._topicCreation(topics);

      expect(logger.warn.callCount).to.be.greaterThan(0);
    });
  });
});
