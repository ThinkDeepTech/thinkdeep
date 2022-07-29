import {EconomicEntityFactory, EconomicEntityType} from '@thinkdeep/model';
import chai from 'chai';
import chaiAsPromised from 'chai-as-promised';
import moment from 'moment';
import sinon from 'sinon';
import sinonChai from 'sinon-chai';

import {Neo4jStore} from '../src/datasource/neo4j-store.js';
import {AnalysisService} from '../src/analysis-service.js';
const expect = chai.expect;
chai.use(sinonChai);
chai.use(chaiAsPromised);

describe('analysis-service', () => {
  let sentimentLib;
  let logger;
  let kafkaClient;
  let neo4jDataStore;
  let admin;
  let consumer;
  let producer;
  let subject;
  beforeEach(() => {
    sentimentLib = {
      analyze: sinon.stub(),
    };
    admin = {
      createTopics: sinon.stub(),
      connect: sinon.stub(),
      disconnect: sinon.stub(),
    };
    consumer = {
      subscribe: sinon.stub().returns(Promise.resolve()),
      run: sinon.stub().returns(Promise.resolve()),
      connect: sinon.stub(),
      disconnect: sinon.stub(),
    };
    producer = {
      send: sinon.stub(),
      connect: sinon.stub(),
      disconnect: sinon.stub(),
    };
    logger = {
      debug: sinon.stub(),
      info: sinon.stub(),
      warn: sinon.stub(),
      error: sinon.stub(),
    };
    kafkaClient = {
      admin: sinon.stub().returns(admin),
      producer: sinon.stub().returns(producer),
      consumer: sinon.stub().returns(consumer),
    };
    neo4jDataStore = sinon.createStubInstance(Neo4jStore);
    neo4jDataStore.readMostRecentSentiment.returns([
      Object.freeze({
        utcDateTime: moment().utc().format(),
        comparative: 1,
        tweets: [
          {
            text: 'text',
          },
        ],
      }),
    ]);
    neo4jDataStore.readSentiments.returns([
      Object.freeze({
        utcDateTime: moment().utc().format(),
        comparative: 1,
        tweets: [
          {
            text: 'text',
          },
        ],
      }),
    ]);
    subject = new AnalysisService(
      neo4jDataStore,
      sentimentLib,
      kafkaClient,
      logger
    );
  });

  describe('constructor', () => {
    it('should create a kafka admin', () => {
      expect(kafkaClient.admin.callCount).to.be.greaterThan(0);
    });

    it('should create a kafka producer', () => {
      expect(kafkaClient.producer.callCount).to.be.greaterThan(0);
    });

    it('should create a kafka consumer', () => {
      expect(kafkaClient.consumer.callCount).to.be.greaterThan(0);
    });

    it('should assign the consumer to a consumer group', () => {
      const args = kafkaClient.consumer.getCall(0).args;
      expect(args[0].groupId).not.to.equal(undefined);
      expect(args[0].groupId).not.to.equal(null);
      expect(args[0].groupId).not.to.equal('');
    });
  });

  describe('connect', () => {
    it('should subscribe to receive updates when tweets are collected', async () => {
      await subject.connect();
      const subscriptionOptions = consumer.subscribe.getCall(0).args[0];
      expect(subscriptionOptions.topic).to.equal('TWEETS_COLLECTED');
    });

    it('should read all tweets that have collected', async () => {
      await subject.connect();
      const subscriptionOptions = consumer.subscribe.getCall(0).args[0];
      expect(subscriptionOptions.fromBeginning).to.equal(true);
    });

    it('should compute the sentiment of each set of tweets collected', async () => {
      const economicEntity = EconomicEntityFactory.economicEntity({
        name: 'google',
        type: EconomicEntityType.Business,
      });
      const message1 = {
        value: {
          economicEntity: economicEntity.toObject(),
          timeSeriesItems: [
            {
              utcDateTime: moment.utc().format(),
              tweets: [
                {
                  text: 'Text',
                },
              ],
            },
          ],
        },
      };
      const message2 = {
        value: {
          economicEntity: economicEntity.toObject(),
          timeSeriesItems: [
            {
              utcDateTime: moment.utc().format(),
              tweets: [
                {
                  text: 'something',
                },
                {
                  text: 'third text value',
                },
              ],
            },
          ],
        },
      };

      message1.value.toString = () => {
        return JSON.stringify(message1.value);
      };

      message2.value.toString = () => {
        return JSON.stringify(message2.value);
      };

      const sentimentResult = {
        score: 1,
      };
      sentimentLib.analyze.returns(sentimentResult);

      await subject.connect();
      const options = consumer.run.getCall(0).args[0];
      const messageProcessor = options.eachMessage;

      await messageProcessor({message: message1});
      await messageProcessor({message: message2});

      expect(sentimentLib.analyze.callCount).to.equal(3);
    });

    it('should wait for leaders to be assigned during topic creation', async () => {
      await subject.connect();

      const adminArg = admin.createTopics.getCall(0).args[0];
      expect(admin.createTopics.callCount).to.equal(1);
      expect(adminArg.waitForLeaders).to.equal(true);
    });
  });

  describe('sentiments', () => {
    it('should require valid economic entities', async () => {
      const economicEntity = {
        name: 'google',
        type: 'GOOGLE',
      };
      const startDate = moment().utc().subtract(1, 'month').format();
      const endDate = null;

      await expect(
        subject.sentiments([economicEntity], startDate, endDate)
      ).to.be.rejectedWith(Error);
    });

    it('should fail if an invalid utc start date is provided', async () => {
      const economicEntity = EconomicEntityFactory.economicEntity({
        name: 'google',
        type: EconomicEntityType.Business,
      });
      const startDate = '1G';
      const endDate = moment().utc().format();

      await expect(
        subject.sentiments([economicEntity], startDate, endDate)
      ).to.be.rejectedWith(Error);
    });

    it('should fail if a null start date is provided', async () => {
      const economicEntity = EconomicEntityFactory.economicEntity({
        name: 'google',
        type: EconomicEntityType.Business,
      });
      const startDate = null;
      const endDate = moment().utc().format();

      await expect(
        subject.sentiments([economicEntity], startDate, endDate)
      ).to.be.rejectedWith(Error);
    });

    it('should fail if an invalid end date is provided', async () => {
      const economicEntity = EconomicEntityFactory.economicEntity({
        name: 'google',
        type: EconomicEntityType.Business,
      });
      const startDate = moment().utc().subtract(1, 'month').format();
      const endDate = '1G';

      await expect(
        subject.sentiments([economicEntity], startDate, endDate)
      ).to.be.rejectedWith(Error);
    });

    it('should accept a null for the end date', async () => {
      const startDate = moment().utc().subtract(1, 'month').format();
      const endDate = null;

      await expect(
        subject.sentiments([], startDate, endDate)
      ).not.to.be.rejectedWith(Error);
    });

    it('should require the user to have read all access', async () => {
      const startDate = moment().utc().subtract(1, 'month').format();
      const endDate = null;
      const permissions = {scope: 'read:something'};

      const actual = await subject.sentiments(
        [],
        startDate,
        endDate,
        permissions
      );
      expect(Array.isArray(actual)).to.equal(true);
      expect(actual.length).to.equal(0);
    });

    it('should map economic entities to the appropriate data', async () => {
      const economicEntity = EconomicEntityFactory.economicEntity({
        name: 'google',
        type: EconomicEntityType.Business,
      });
      const startDate = moment().utc().subtract(1, 'month').format();
      const endDate = null;
      const permissions = {scope: 'read:all'};

      const expected = Object.freeze({
        utcDateTime: moment().utc().format(),
        comparative: 1,
        tweets: [
          {
            text: 'text',
          },
        ],
      });
      neo4jDataStore.readSentiments.returns([expected]);

      const actuals = await subject.sentiments(
        [economicEntity],
        startDate,
        endDate,
        permissions
      );
      expect(actuals[0][0]).to.equal(expected);
    });

    it('should keep the order of the received economic entities in results', async () => {
      const economicEntity1 = EconomicEntityFactory.economicEntity({
        name: 'google',
        type: EconomicEntityType.Business,
      });
      const economicEntity2 = EconomicEntityFactory.economicEntity({
        name: 'amazon',
        type: EconomicEntityType.Business,
      });
      const startDate = moment().utc().subtract(1, 'month').format();
      const endDate = null;
      const permissions = {scope: 'read:all'};

      const economicEntitySentiment1 = Object.freeze({
        utcDateTime: moment().utc().format(),
        comparative: 1,
        tweets: [
          {
            text: 'text',
          },
        ],
      });
      neo4jDataStore.readSentiments
        .withArgs(economicEntity1)
        .returns([economicEntitySentiment1]);

      const economicEntitySentiment2 = Object.freeze({
        utcDateTime: moment().utc().format(),
        comparative: 2,
        tweets: [
          {
            text: 'something new',
          },
          {
            text: 'This is economic entity 2',
          },
        ],
      });
      neo4jDataStore.readSentiments
        .withArgs(economicEntity2)
        .returns([economicEntitySentiment2]);

      const actuals = await subject.sentiments(
        [economicEntity1, economicEntity2],
        startDate,
        endDate,
        permissions
      );
      expect(actuals[0][0]).to.equal(economicEntitySentiment1);
      expect(actuals[1][0]).to.equal(economicEntitySentiment2);
    });
  });

  describe('_sentimentData', () => {
    it('should require valid economic entities', async () => {
      const economicEntity = {
        name: 'google',
        type: 'GOOGLE',
      };
      const startDate = moment().utc().subtract(1, 'month').format();
      const endDate = null;

      await expect(
        subject._sentimentData(economicEntity, startDate, endDate)
      ).to.be.rejectedWith(Error);
    });

    it('should fail if an invalid utc start date is provided', async () => {
      const economicEntity = EconomicEntityFactory.economicEntity({
        name: 'google',
        type: EconomicEntityType.Business,
      });
      const startDate = '1G';
      const endDate = moment().utc().format();

      await expect(
        subject._sentimentData(economicEntity, startDate, endDate)
      ).to.be.rejectedWith(Error);
    });

    it('should fail if a null start date is provided', async () => {
      const economicEntity = EconomicEntityFactory.economicEntity({
        name: 'google',
        type: EconomicEntityType.Business,
      });
      const startDate = null;
      const endDate = moment().utc().format();

      await expect(
        subject._sentimentData(economicEntity, startDate, endDate)
      ).to.be.rejectedWith(Error);
    });

    it('should fail if an invalid end date is provided', async () => {
      const economicEntity = EconomicEntityFactory.economicEntity({
        name: 'google',
        type: EconomicEntityType.Business,
      });
      const startDate = moment().utc().subtract(1, 'month').format();
      const endDate = '1G';

      await expect(
        subject._sentimentData(economicEntity, startDate, endDate)
      ).to.be.rejectedWith(Error);
    });

    it('should accept a null for the end date', async () => {
      const economicEntity = EconomicEntityFactory.economicEntity({
        name: 'google',
        type: EconomicEntityType.Business,
      });
      const startDate = moment().utc().subtract(1, 'month').format();
      const endDate = null;

      await expect(
        subject._sentimentData(economicEntity, startDate, endDate)
      ).not.to.be.rejectedWith(Error);
    });

    it('should read sentiment', async () => {
      const economicEntity = EconomicEntityFactory.economicEntity({
        name: 'google',
        type: EconomicEntityType.Business,
      });
      const startDate = moment().utc().subtract(1, 'month').format();
      const endDate = null;

      await subject._sentimentData(economicEntity, startDate, endDate);
      expect(neo4jDataStore.readSentiments.callCount).to.equal(1);
    });
  });

  describe('_computeSentiment', () => {
    it('should compute the sentiment for each tweet entry', async () => {
      const utcDateTime = moment().utc().format();
      const economicEntity = EconomicEntityFactory.economicEntity({
        name: 'google',
        type: EconomicEntityType.Business,
      });
      const timeSeriesData = [
        {
          utcDateTime,
          economicEntity,
          tweets: [
            {
              text: 'something random',
            },
            {
              text: 'something different',
            },
          ],
        },
      ];

      sentimentLib.analyze.returns({
        comparative: 1,
      });

      await subject._computeSentiment(economicEntity, timeSeriesData);

      expect(sentimentLib.analyze.callCount).to.be.greaterThan(0);
    });

    it('should skip over entries that include a null value for tweets ', async () => {
      const utcDateTime = moment().utc().format();
      const economicEntity = EconomicEntityFactory.economicEntity({
        name: 'google',
        type: EconomicEntityType.Business,
      });
      const timeSeriesData = [
        {
          utcDateTime,
          economicEntity,
          tweets: null,
        },
      ];

      sentimentLib.analyze.returns({
        comparative: 1,
      });

      await subject._computeSentiment(economicEntity, timeSeriesData);

      expect(sentimentLib.analyze.callCount).to.equal(0);
    });

    it('should skip over entries that include an empty tweets array ', async () => {
      const utcDateTime = moment().utc().format();
      const economicEntity = EconomicEntityFactory.economicEntity({
        name: 'google',
        type: EconomicEntityType.Business,
      });
      const timeSeriesData = [
        {
          utcDateTime,
          economicEntity,
          tweets: [],
        },
      ];

      sentimentLib.analyze.returns({
        comparative: 1,
      });

      await subject._computeSentiment(economicEntity, timeSeriesData);

      expect(sentimentLib.analyze.callCount).to.equal(0);
    });

    it('should add a message to the queue indicating the sentiments computed', async () => {
      const utcDateTime = moment().utc().format();
      const economicEntity = EconomicEntityFactory.economicEntity({
        name: 'google',
        type: EconomicEntityType.Business,
      });
      const timeSeriesData = [
        {
          utcDateTime,
          economicEntity,
          tweets: [
            {
              text: 'something random',
            },
            {
              text: 'something different',
            },
          ],
        },
      ];

      neo4jDataStore.readMostRecentSentiment.returns([
        Object.freeze({
          utcDateTime,
          comparative: 1,
          tweets: timeSeriesData[0].tweets,
        }),
      ]);

      sentimentLib.analyze.returns({
        comparative: 1,
      });

      await subject._computeSentiment(economicEntity, timeSeriesData);

      const sendArg = producer.send.getCall(0).args[0];
      const sentEvent = JSON.parse(sendArg.messages[0].value);
      expect(sendArg.topic).to.equal('SENTIMENT_COMPUTED');
      expect(sentEvent.economicEntity.name).to.equal(economicEntity.name);
      expect(sentEvent.economicEntity.type).to.equal(economicEntity.type);

      const eventTweets = sentEvent.data.tweets;
      expect(eventTweets[0].text).to.equal(timeSeriesData[0].tweets[0].text);
      expect(eventTweets[1].text).to.equal(timeSeriesData[0].tweets[1].text);
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
