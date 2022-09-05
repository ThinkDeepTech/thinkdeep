import {
  EconomicEntityFactory,
  CollectionOperationType,
  EconomicEntityType,
  EconomicSectorFactory,
  EconomicSectorType,
} from '@thinkdeep/model';
import chai from 'chai';
import {execute} from './execute.js';
import moment from 'moment';
import sinonChai from 'sinon-chai';
const expect = chai.expect;

chai.use(sinonChai);

describe('data-collector', () => {
  /**
   * NOTE: This path is relative to the current working directory which, when tests are executed,
   * is the root of the project.
   */
  const modulePath = './src/data-collector.js';

  it('should require the operation type', async () => {
    const entityName = 'Google';
    const entityType = EconomicEntityType.Business;
    const subject = EconomicEntityFactory.get({
      name: entityName,
      type: entityType,
    });
    try {
      await execute(
        modulePath,
        [
          `--economic-entity=${JSON.stringify(subject)}`,
          `--mock-data={ "name": "something" }`,
        ],
        {env: process.env}
      );
      chai.assert.fail('An error should have been thrown but was not.');
    } catch (e) {
      expect(e).to.include('Operation type is required');
    }
  });

  it('should use utc formatted time as event', async () => {
    const entityName = 'Google';
    const entityType = EconomicEntityType.Business;
    const subject = EconomicEntityFactory.get({
      name: entityName,
      type: entityType,
    });
    const operationType = CollectionOperationType.FetchTweets;

    const logMessage = await execute(
      modulePath,
      [
        `--economic-entity=${JSON.stringify(subject)}`,
        `--operation-type=${operationType}`,
        `--mock-data={ "name": "something" }`,
      ],
      {env: process.env}
    );

    let dataStr = '';
    for (const entry of logMessage.split('\n')) {
      if (entry.includes('Emitting event TWEETS_FETCHED. Data: ')) {
        dataStr = entry.replace(/^.*Emitting event TWEETS_FETCHED. Data: /, '');
      }
    }

    const data = JSON.parse(dataStr);

    expect(moment.utc(data.utcDateTime).isValid()).to.equal(true);
    expect(data.utcDateTime).to.include('T');
    expect(data.utcDateTime).to.include('Z');
  });

  it('should pass valid economic entity in event', async () => {
    const entityName = 'Google';
    const entityType = EconomicEntityType.Business;
    const operationType = CollectionOperationType.FetchTweets;
    const subject = EconomicEntityFactory.get({
      name: entityName,
      type: entityType,
    });

    const logMessage = await execute(
      modulePath,
      [
        `--economic-entity=${JSON.stringify(subject)}`,
        `--operation-type=${operationType}`,
        `--mock-data={ "name": "something" }`,
      ],
      {env: process.env}
    );

    let dataStr = '';
    for (const entry of logMessage.split('\n')) {
      if (entry.includes('Emitting event TWEETS_FETCHED. Data: ')) {
        dataStr = entry.replace(/^.*Emitting event TWEETS_FETCHED. Data: /, '');
      }
    }

    const data = JSON.parse(dataStr);

    expect(() => EconomicEntityFactory.get(data.economicEntity)).not.to.throw();
  });

  describe(`${CollectionOperationType.FetchTweets}`, () => {
    let mockData;
    beforeEach(() => {
      mockData = [
        {
          text: 'tweet 1',
        },
        {
          text: 'tweet 2',
        },
        {
          text: 'tweet 3',
        },
      ];
    });

    it('should fetch tweets from the twitter API', async () => {
      const entityName = 'Google';
      const entityType = EconomicEntityType.Business;
      const operationType = CollectionOperationType.FetchTweets;

      const subject = EconomicEntityFactory.get({
        name: entityName,
        type: entityType,
      });

      const response = await execute(
        modulePath,
        [
          `--economic-entity=${JSON.stringify(subject)}`,
          `--operation-type=${operationType}`,
          `--mock-data=${JSON.stringify(mockData)}`,
        ],
        {env: process.env}
      );

      expect(response.trim()).to.include('Querying recent tweets');
      expect(response.trim()).to.include(JSON.stringify(mockData));
    });

    it('should add the TWEETS_FETCHED event to kafka', async () => {
      const entityName = 'Google';
      const entityType = EconomicEntityType.Business;
      const operationType = CollectionOperationType.FetchTweets;

      const subject = EconomicEntityFactory.get({
        name: entityName,
        type: entityType,
      });

      const response = await execute(
        modulePath,
        [
          `--economic-entity=${JSON.stringify(subject)}`,
          `--operation-type=${operationType}`,
          `--mock-data=${JSON.stringify(mockData)}`,
        ],
        {env: process.env}
      );

      expect(response.trim()).to.include('Emitting event TWEETS_FETCHED');
    });
  });

  describe(`${CollectionOperationType.ScrapeData}`, () => {
    let mockData;
    beforeEach(() => {
      mockData = {};
    });

    it('should scrape the competitors', async () => {
      const entityName = 'Google';
      const entityType = EconomicSectorType.Business;
      const subject = EconomicEntityFactory.get({
        name: entityName,
        type: entityType,
      });
      const operationType = CollectionOperationType.ScrapeData;

      const data = {
        subject: EconomicEntityFactory.get({
          name: 'Alphabet',
          type: EconomicEntityType.Business,
        }),
        owns: [
          EconomicEntityFactory.get({
            name: 'DeepMind',
            type: EconomicEntityType.Business,
          }),
        ],
        competitors: [
          EconomicEntityFactory.get({
            name: 'Amazon',
            type: EconomicEntityType.Business,
          }),
        ],
        products: [],
        services: [],
        executives: [],
        sectors: [
          EconomicSectorFactory.get({
            type: EconomicSectorType.InformationTechnology,
          }),
        ],
      };

      const response = await execute(
        modulePath,
        [
          `--economic-entity=${JSON.stringify(subject)}`,
          `--operation-type=${operationType}`,
          `--mock-data=${JSON.stringify(mockData)}`,
        ],
        {env: process.env}
      );

      expect(response.trim()).to.include(
        `Scraping data for ${entityType} ${entityName}.`
      );
      expect(response.trim()).to.include(`${JSON.stringify(data.competitors)}`);
    });

    it('should scrape the products', async () => {
      const entityName = 'Google';
      const entityType = EconomicEntityType.Business;
      const operationType = CollectionOperationType.ScrapeData;

      const subject = EconomicEntityFactory.get({
        name: entityName,
        type: entityType,
      });

      const data = {
        subject: EconomicEntityFactory.get({
          name: 'Alphabet',
          type: EconomicEntityType.Business,
        }),
        owns: [
          EconomicEntityFactory.get({
            name: 'DeepMind',
            type: EconomicEntityType.Business,
          }),
        ],
        competitors: [
          EconomicEntityFactory.get({
            name: 'Amazon',
            type: EconomicEntityType.Business,
          }),
        ],
        products: [],
        services: [],
        executives: [],
        sectors: [
          EconomicSectorFactory.get({
            type: EconomicSectorType.InformationTechnology,
          }),
        ],
      };

      const response = await execute(
        modulePath,
        [
          `--economic-entity=${JSON.stringify(subject)}`,
          `--operation-type=${operationType}`,
          `--mock-data=${JSON.stringify(mockData)}`,
        ],
        {env: process.env}
      );

      expect(response.trim()).to.include(
        `Scraping data for ${entityType} ${entityName}.`
      );
      expect(response.trim()).to.include(`${JSON.stringify(data.products)}`);
    });
    it('should scrape the services', async () => {
      const entityName = 'Google';
      const entityType = EconomicEntityType.Business;
      const operationType = CollectionOperationType.ScrapeData;

      const subject = EconomicEntityFactory.get({
        name: entityName,
        type: entityType,
      });

      const data = {
        subject: EconomicEntityFactory.get({
          name: 'Alphabet',
          type: EconomicEntityType.Business,
        }),
        owns: [
          EconomicEntityFactory.get({
            name: 'DeepMind',
            type: EconomicEntityType.Business,
          }),
        ],
        competitors: [
          EconomicEntityFactory.get({
            name: 'Amazon',
            type: EconomicEntityType.Business,
          }),
        ],
        products: [],
        services: [],
        executives: [],
        sectors: [
          EconomicSectorFactory.get({
            type: EconomicSectorType.InformationTechnology,
          }),
        ],
      };

      const response = await execute(
        modulePath,
        [
          `--economic-entity=${JSON.stringify(subject)}`,
          `--operation-type=${operationType}`,
          `--mock-data=${JSON.stringify(mockData)}`,
        ],
        {env: process.env}
      );

      expect(response.trim()).to.include(
        `Scraping data for ${entityType} ${entityName}.`
      );
      expect(response.trim()).to.include(`${JSON.stringify(data.services)}`);
    });

    it('should scrape the executives', async () => {
      const entityName = 'Google';
      const entityType = EconomicEntityType.Business;
      const operationType = CollectionOperationType.ScrapeData;

      const subject = EconomicEntityFactory.get({
        name: entityName,
        type: entityType,
      });

      const data = {
        subject: EconomicEntityFactory.get({
          name: 'Alphabet',
          type: EconomicEntityType.Business,
        }),
        owns: [
          EconomicEntityFactory.get({
            name: 'DeepMind',
            type: EconomicEntityType.Business,
          }),
        ],
        competitors: [
          EconomicEntityFactory.get({
            name: 'Amazon',
            type: EconomicEntityType.Business,
          }),
        ],
        products: [],
        services: [],
        executives: [],
        sectors: [
          EconomicSectorFactory.get({
            type: EconomicSectorType.InformationTechnology,
          }),
        ],
      };

      const response = await execute(
        modulePath,
        [
          `--economic-entity=${JSON.stringify(subject)}`,
          `--operation-type=${operationType}`,
          `--mock-data=${JSON.stringify(mockData)}`,
        ],
        {env: process.env}
      );

      expect(response.trim()).to.include(
        `Scraping data for ${entityType} ${entityName}.`
      );
      expect(response.trim()).to.include(`${JSON.stringify(data.executives)}`);
    });

    it('should scrape the business size', async () => {
      const entityName = 'Google';
      const entityType = EconomicEntityType.Business;
      const operationType = CollectionOperationType.ScrapeData;

      const subject = EconomicEntityFactory.get({
        name: entityName,
        type: entityType,
      });

      const data = {
        subject: EconomicEntityFactory.get({
          name: 'Alphabet',
          type: EconomicEntityType.Business,
        }),
        owns: [
          EconomicEntityFactory.get({
            name: 'DeepMind',
            type: EconomicEntityType.Business,
          }),
        ],
        competitors: [
          EconomicEntityFactory.get({
            name: 'Amazon',
            type: EconomicEntityType.Business,
          }),
        ],
        products: [],
        services: [],
        executives: [],
        sectors: [
          EconomicSectorFactory.get({
            type: EconomicSectorType.InformationTechnology,
          }),
        ],
      };

      const response = await execute(
        modulePath,
        [
          `--economic-entity=${JSON.stringify(subject)}`,
          `--operation-type=${operationType}`,
          `--mock-data=${JSON.stringify(mockData)}`,
        ],
        {env: process.env}
      );

      expect(response.trim()).to.include(
        `Scraping data for ${entityType} ${entityName}.`
      );
      expect(response.trim()).to.include(`${JSON.stringify(data.size)}`);
    });

    it('should scrape the industry', async () => {
      const entityName = 'Google';
      const entityType = EconomicEntityType.Business;
      const operationType = CollectionOperationType.ScrapeData;

      const subject = EconomicEntityFactory.get({
        name: entityName,
        type: entityType,
      });

      const data = {
        subject: EconomicEntityFactory.get({
          name: 'Alphabet',
          type: EconomicEntityType.Business,
        }),
        owns: [
          EconomicEntityFactory.get({
            name: 'DeepMind',
            type: EconomicEntityType.Business,
          }),
        ],
        competitors: [
          EconomicEntityFactory.get({
            name: 'Amazon',
            type: EconomicEntityType.Business,
          }),
        ],
        products: [],
        services: [],
        executives: [],
        sectors: [
          EconomicSectorFactory.get({
            type: EconomicSectorType.InformationTechnology,
          }),
        ],
      };

      const response = await execute(
        modulePath,
        [
          `--economic-entity=${JSON.stringify(subject)}`,
          `--operation-type=${operationType}`,
          `--mock-data=${JSON.stringify(mockData)}`,
        ],
        {env: process.env}
      );

      expect(response.trim()).to.include(
        `Scraping data for ${entityType} ${entityName}.`
      );
      expect(response.trim()).to.include(`${JSON.stringify(data.industry)}`);
    });
  });
});
