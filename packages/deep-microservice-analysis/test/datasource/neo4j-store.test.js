import chai from 'chai';
import chaiAsPromised from 'chai-as-promised';
import sinon from 'sinon';
import sinonChai from 'sinon-chai';
import neo4jDriver from 'neo4j-driver';
import {EconomicEntityFactory, EconomicEntityType} from '@thinkdeep/model';

import {Neo4jStore} from '../../src/datasource/neo4j-store.js';
import moment from 'moment';
const expect = chai.expect;
chai.use(sinonChai);
chai.use(chaiAsPromised);

describe('neo4j-store', () => {
  let subject;
  let neo4j;
  let driver;
  let session;
  const sentimentResults = {
    records: [
      {
        keys: ['utcDateTime', 'tweets', 'comparativeAvg'],
        length: 3,
        _fields: [
          '2022-07-30T12:00:02Z',
          [
            {
              identity: 2565,
              labels: ['Data'],
              properties: {
                type: 'tweet',
                value:
                  '@princessyaaady If you want to go "vegan" I would recommend you educate yourself on where your meat and dairy actually come from (watch Dominion). If you are more interested in plant-based eating watch Forks over Knives https://t.co/MhTRsAOoXw',
              },
            },
            {
              identity: 2563,
              labels: ['Data'],
              properties: {
                type: 'tweet',
                value:
                  '@princessyaaady You can find lots of great recipes on Pinterest. Also watch documentaries like The Game Changers, Forks Over Knives and What the Health for starters. It’s easier than you think.',
              },
            },
            {
              identity: 2561,
              labels: ['Data'],
              properties: {
                type: 'tweet',
                value:
                  'The Forks Over Knives Plan: How to Transition to the Life-Saving, Whole-Food, Plant-Based Diet [IXMCOUU]\n\nhttps://t.co/OuLx0iqtcs',
              },
            },
            {
              identity: 2559,
              labels: ['Data'],
              properties: {
                type: 'tweet',
                value:
                  'Forks Over Knives: The Plant-Based Way to Health. The #1 New York Times Bestseller [JYFTEX2]\n\nhttps://t.co/d1MroSTEaq',
              },
            },
            {
              identity: 2557,
              labels: ['Data'],
              properties: {
                type: 'tweet',
                value:
                  "The documentary FORKS OVER KNIVES (https://t.co/7pomaBiFg5 …) gets DOCTORS who watch to learn they can heal both themselves AND their patients. It's not about mopping the wet floor...it's about turning off the faucet! #WFPB #CPBNM #Vegan #EatPlants",
              },
            },
            {
              identity: 2555,
              labels: ['Data'],
              properties: {
                type: 'tweet',
                value:
                  '#DrSheilShukla Highlights #Vegan #Indian #Recipes in Vibrant #New #Cookbook - Forks Over Knives\nhttps://t.co/q3JzZTLvus via @ForksOverKnives\n#Veganism #PlantBased #Diet',
              },
            },
            {
              identity: 2553,
              labels: ['Data'],
              properties: {
                type: 'tweet',
                value:
                  '@BettyJunod Mango and black bean salad, portabella mushroom pizza, impossible burgers, veggie fried rice.\n\nI highly recommend the Forks Over Knives cookbook.',
              },
            },
            {
              identity: 2551,
              labels: ['Data'],
              properties: {
                type: 'tweet',
                value:
                  'Forks Over Knives: Flavor!: Delicious, Whole-Food, Plant-Based Recipes to Cook Every Day [7D42AEY]\n\nhttps://t.co/p5IpLwtLqw',
              },
            },
            {
              identity: 2549,
              labels: ['Data'],
              properties: {
                type: 'tweet',
                value:
                  "It looks like the climate crisis is over in Canada. Thank God we have a shield that protects us from the crisis that they swear is happening globally. I saw wooden forks and knives at can tire today so you know it's really done. https://t.co/NXb8blgeyO",
              },
            },
            {
              identity: 2547,
              labels: ['Data'],
              properties: {
                type: 'tweet',
                value:
                  '@AshleyGWinter Or if you want something to make you healthier: From Stress to Happiness, Game Changers (both Netflix) or Forks Over Knives (Amazon)',
              },
            },
          ],
          0.07788017540306955,
        ],
        _fieldLookup: {utcDateTime: 0, tweets: 1, comparativeAvg: 2},
      },
    ],
    summary: {
      query: {
        text: "\n        MATCH (:EconomicEntity { name: $entityName, type: $entityType}) -[:OPERATED_ON]-> (dateTime:DateTime) -[:RECEIVED_DATA]-> (tweet:Data { type: \"tweet\" }) -[:RECEIVED_MEASUREMENT]-> (sentiment:Sentiment)\n        WITH dateTime, tweet, sentiment\n        ORDER BY dateTime.value DESC\n        RETURN apoc.date.format(dateTime.value.epochMillis, 'ms', \"yyyy-MM-dd'T'HH:mm:ss'Z'\") as utcDateTime, collect(tweet) as tweets, avg(sentiment.comparative) as comparativeAvg\n        LIMIT 1\n      ",
        parameters: {entityName: 'Forks Over Knives', entityType: 'BUSINESS'},
      },
      queryType: 'r',
      counters: {
        _stats: {
          nodesCreated: 0,
          nodesDeleted: 0,
          relationshipsCreated: 0,
          relationshipsDeleted: 0,
          propertiesSet: 0,
          labelsAdded: 0,
          labelsRemoved: 0,
          indexesAdded: 0,
          indexesRemoved: 0,
          constraintsAdded: 0,
          constraintsRemoved: 0,
        },
        _systemUpdates: 0,
      },
      updateStatistics: {
        _stats: {
          nodesCreated: 0,
          nodesDeleted: 0,
          relationshipsCreated: 0,
          relationshipsDeleted: 0,
          propertiesSet: 0,
          labelsAdded: 0,
          labelsRemoved: 0,
          indexesAdded: 0,
          indexesRemoved: 0,
          constraintsAdded: 0,
          constraintsRemoved: 0,
        },
        _systemUpdates: 0,
      },
      plan: false,
      profile: false,
      notifications: [],
      server: {
        address: 'test.api.neo4j.predecos.com:7687',
        version: 'Neo4j/4.4.8',
        agent: 'Neo4j/4.4.8',
        protocolVersion: 4.4,
      },
      resultConsumedAfter: 3,
      resultAvailableAfter: 1,
      database: {name: 'neo4j'},
    },
  };

  /**
   * Verify that the received data is valid through expect statements.
   * @param {Object} storeResults Data returned from the data store.
   */
  const expectValidSentimentOutput = (storeResults) => {
    expect(Array.isArray(storeResults)).to.equal(true);
    for (const result of storeResults) {
      expect(moment.utc(result.utcDateTime).isValid()).to.equal(true);
      expect(result.comparative).to.be.greaterThanOrEqual(-5);
      expect(result.comparative).to.be.lessThanOrEqual(5);
      expect(Array.isArray(result.tweets)).to.equal(true);
      for (const tweet of result.tweets) {
        expect(tweet.text).not.to.equal(undefined);
        expect(tweet.text).not.to.equal(null);
        expect(tweet.text).not.to.equal('');
      }
    }
    expect(storeResults.length).to.be.greaterThan(0);
  };

  beforeEach(() => {
    neo4j = sinon.stub(neo4jDriver);

    driver = sinon.createStubInstance(neo4jDriver.Driver);

    session = sinon.createStubInstance(neo4jDriver.Session);

    neo4j.driver.returns(driver);

    driver.session.returns(session);

    subject = new Neo4jStore({
      url: 'neo4j://some/url',
      defaultDatabase: 'neo4j',
      defaultAccessMode: neo4j.session.READ,
      neo4j,
    });
  });

  afterEach(() => {
    sinon.restore();
  });

  describe('addSentiments', () => {
    it('should throw if invalid economic entities are provided', async () => {
      const economicEntity = {
        name: 'google',
        type: 'GOOGLE',
      };
      const datas = [];

      await expect(
        subject.addSentiments(economicEntity, datas)
      ).to.be.rejectedWith(Error);
    });

    it('should throw if datas is not an array', async () => {
      const economicEntity = EconomicEntityFactory.get({
        name: 'google',
        type: EconomicEntityType.Business,
      });
      const datas = undefined;

      await expect(
        subject.addSentiments(economicEntity, datas)
      ).to.be.rejectedWith(Error);
    });

    it('should do nothing if an empty array is passed', async () => {
      const economicEntity = EconomicEntityFactory.get({
        name: 'google',
        type: EconomicEntityType.Business,
      });
      const datas = [];

      await subject.addSentiments(economicEntity, datas);

      expect(driver.session.callCount).to.equal(0);
    });

    it('should throw an error if invalid sentiment data is provided', async () => {
      const economicEntity = EconomicEntityFactory.get({
        name: 'google',
        type: EconomicEntityType.Business,
      });
      const datas = [
        {
          utcDateTime: 1,
        },
      ];

      await expect(
        subject.addSentiments(economicEntity, datas)
      ).to.be.rejectedWith(Error);
    });

    it('should add the economic entity to the data store', async () => {
      const economicEntity = EconomicEntityFactory.get({
        name: 'google',
        type: EconomicEntityType.Business,
      });
      const datas = [
        {
          utcDateTime: moment().utc().format(),
          tweet: 'Hi there tony!',
          sentiment: {
            comparative: 2,
          },
        },
      ];

      await subject.addSentiments(economicEntity, datas);

      const query = session.run.getCall(0).args[0];
      const variables = session.run.getCall(0).args[1];
      expect(query).to.contain(
        'MERGE (:EconomicEntity { name: $entityName, type: $entityType})'
      );
      expect(variables.entityName).to.equal(economicEntity.name);
      expect(variables.entityType).to.equal(economicEntity.type);
    });

    it('should add the date to the economic entity', async () => {
      const economicEntity = EconomicEntityFactory.get({
        name: 'google',
        type: EconomicEntityType.Business,
      });
      const datas = [
        {
          utcDateTime: moment().utc().format(),
          tweet: 'Hi there tony!',
          sentiment: {
            comparative: 2,
          },
        },
      ];

      await subject.addSentiments(economicEntity, datas);

      const query = session.run.getCall(1).args[0];
      const variables = session.run.getCall(1).args[1];
      expect(query).to
        .contain(`MATCH (economicEntity:EconomicEntity { name: $entityName, type: $entityType})
      MERGE (economicEntity) -[:OPERATED_ON]-> (:DateTime { value: datetime($utcDateTime) })`);
      expect(variables.entityName).to.equal(economicEntity.name);
      expect(variables.entityType).to.equal(economicEntity.type);
      expect(variables.utcDateTime).to.equal(datas[0].utcDateTime);
    });

    it('should add the sentiment', async () => {
      const economicEntity = EconomicEntityFactory.get({
        name: 'google',
        type: EconomicEntityType.Business,
      });
      const datas = [
        {
          utcDateTime: moment().utc().format(),
          tweet: 'Hi there tony!',
          sentiment: {
            comparative: 2,
          },
        },
      ];

      await subject.addSentiments(economicEntity, datas);

      const query = session.run.getCall(2).args[0];
      const variables = session.run.getCall(2).args[1];
      expect(query).to
        .contain(`MATCH (economicEntity:EconomicEntity { name: $entityName, type: $entityType})
      MATCH (economicEntity) -[:OPERATED_ON]-> (dateTime:DateTime { value: datetime($utcDateTime) })
      MERGE (dateTime) -[:RECEIVED_DATA]-> (data:Data { type: "tweet", value: $tweet })
      MERGE (data) -[:RECEIVED_MEASUREMENT]-> (:Sentiment { comparative: $comparative })`);
      expect(variables.entityName).to.equal(economicEntity.name);
      expect(variables.entityType).to.equal(economicEntity.type);
      expect(variables.utcDateTime).to.equal(datas[0].utcDateTime);
      expect(variables.tweet).to.equal(datas[0].tweet);
      expect(variables.comparative).to.equal(datas[0].sentiment.comparative);
    });
  });

  describe('readSentiments', () => {
    it('should throw if invalid economic entities are provided', async () => {
      const economicEntity = {
        name: 'google',
        type: 'GOOGLE',
      };
      const startDate = moment().utc().format();
      const endDate = null;

      await expect(
        subject.readSentiments(economicEntity, startDate, endDate)
      ).to.be.rejectedWith(Error);
    });

    it('should throw if invalid start date is provided', async () => {
      const economicEntity = EconomicEntityFactory.get({
        name: 'google',
        type: EconomicEntityType.Business,
      });
      const startDate = '1G';
      const endDate = null;

      await expect(
        subject.readSentiments(economicEntity, startDate, endDate)
      ).to.be.rejectedWith(Error);
    });

    it('should throw if invalid end date is provided', async () => {
      const economicEntity = EconomicEntityFactory.get({
        name: 'google',
        type: EconomicEntityType.Business,
      });
      const startDate = moment().utc().format();
      const endDate = '1G';

      await expect(
        subject.readSentiments(economicEntity, startDate, endDate)
      ).to.be.rejectedWith(Error);
    });

    it('should accept a null end date', async () => {
      const economicEntity = EconomicEntityFactory.get({
        name: 'google',
        type: EconomicEntityType.Business,
      });
      const startDate = moment().utc().format();
      const endDate = null;

      session.run.returns(sentimentResults);

      await expect(
        subject.readSentiments(economicEntity, startDate, endDate)
      ).not.to.be.rejectedWith(Error);
    });

    it('should not include end date in the query when end date is null', async () => {
      const economicEntity = EconomicEntityFactory.get({
        name: 'google',
        type: EconomicEntityType.Business,
      });
      const startDate = moment().utc().format();
      const endDate = null;

      session.run.returns(sentimentResults);

      await subject.readSentiments(economicEntity, startDate, endDate);

      const query = session.run.getCall(0).args[0];
      expect(query).not.to.contain('$endDate');
    });

    it('should include end date in the query when end date is specified', async () => {
      const economicEntity = EconomicEntityFactory.get({
        name: 'google',
        type: EconomicEntityType.Business,
      });
      const startDate = moment().utc().format();
      const endDate = moment().utc().format();

      session.run.returns(sentimentResults);

      await subject.readSentiments(economicEntity, startDate, endDate);

      const query = session.run.getCall(0).args[0];
      expect(query).to.contain('$endDate');
    });

    it('should reduce the query results before return', async () => {
      const economicEntity = EconomicEntityFactory.get({
        name: 'google',
        type: EconomicEntityType.Business,
      });
      const startDate = moment().utc().format();
      const endDate = moment().utc().format();

      session.run.returns(sentimentResults);

      const results = await subject.readSentiments(
        economicEntity,
        startDate,
        endDate
      );

      expectValidSentimentOutput(results);
    });
  });

  describe('readMostRecentSentiment', () => {
    it('should throw if invalid economic entities are provided', async () => {
      const economicEntity = {
        name: 'google',
        type: 'GOOGLE',
      };

      await expect(
        subject.readMostRecentSentiment(economicEntity)
      ).to.be.rejectedWith(Error);
    });

    it('should reduce the query results before return', async () => {
      const economicEntity = EconomicEntityFactory.get({
        name: 'google',
        type: EconomicEntityType.Business,
      });

      const sentimentResultWithOneRecord = {
        ...sentimentResults,
        records: [sentimentResults.records[0]],
      };
      session.run.returns(sentimentResultWithOneRecord);

      const results = await subject.readMostRecentSentiment(economicEntity);

      expectValidSentimentOutput(results);
    });
  });
});
