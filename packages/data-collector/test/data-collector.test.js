import chai from 'chai';
import {execute} from './execute.js';
import moment from 'moment';
import {
  EconomicEntityFactory,
  CollectionOperationType,
  EconomicEntityType,
  EconomicSectorFactory,
  EconomicSectorType,
} from '@thinkdeep/model';

const expect = chai.expect;

describe('data-collector', () => {
  /**
   * NOTE: This path is relative to the current working directory which, when tests are executed,
   * is the root of the project.
   */
  const modulePath = './src/data-collector.js';

  it('should require the entity name', async () => {
    const entityType = 'BUSINESS';
    const operationType = CollectionOperationType.FetchTweets;

    try {
      await execute(
        modulePath,
        [
          `--entity-type=${entityType}`,
          `--operation-type=${operationType}`,
          '--mock-run',
        ],
        {env: process.env}
      );
      chai.assert.fail('An error should have been thrown but was not.');
    } catch (e) {
      expect(e).to.include('Entity name is required');
    }
  });

  it('should require the entity type', async () => {
    const entityName = 'Google';
    const operationType = CollectionOperationType.FetchTweets;

    try {
      await execute(
        modulePath,
        [
          `--entity-name=${entityName}`,
          `--operation-type=${operationType}`,
          '--mock-run',
        ],
        {env: process.env}
      );
      chai.assert.fail('An error should have been thrown but was not.');
    } catch (e) {
      expect(e).to.include('Entity type is required');
    }
  });

  it('should require the operation type', async () => {
    const entityName = 'Google';
    const entityType = EconomicEntityType.Business;

    try {
      await execute(
        modulePath,
        [
          `--entity-name=${entityName}`,
          `--entity-type=${entityType}`,
          '--mock-run',
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
    const operationType = CollectionOperationType.FetchTweets;

    const logMessage = await execute(
      modulePath,
      [
        `--entity-name=${entityName}`,
        `--entity-type=${entityType}`,
        `--operation-type=${operationType}`,
        '--mock-run',
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

    const logMessage = await execute(
      modulePath,
      [
        `--entity-name=${entityName}`,
        `--entity-type=${entityType}`,
        `--operation-type=${operationType}`,
        '--mock-run',
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
    it('should fetch tweets from the twitter API', async () => {
      const entityName = 'Google';
      const entityType = EconomicEntityType.Business;
      const operationType = CollectionOperationType.FetchTweets;

      const response = await execute(
        modulePath,
        [
          `--entity-name=${entityName}`,
          `--entity-type=${entityType}`,
          `--operation-type=${operationType}`,
          '--mock-run',
        ],
        {env: process.env}
      );

      const recentTweets = [
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
      expect(response.trim()).to.include('Querying recent tweets');
      expect(response.trim()).to.include(
        `Retrieved the following tweets: ${JSON.stringify(recentTweets)}`
      );
    });

    it('should add the TWEETS_FETCHED event to kafka', async () => {
      const entityName = 'Google';
      const entityType = EconomicEntityType.Business;
      const operationType = CollectionOperationType.FetchTweets;

      const response = await execute(
        modulePath,
        [
          `--entity-name=${entityName}`,
          `--entity-type=${entityType}`,
          `--operation-type=${operationType}`,
          '--mock-run',
        ],
        {env: process.env}
      );

      expect(response.trim()).to.include('Emitting event TWEETS_FETCHED');
    });
  });

  describe(`${CollectionOperationType.ScrapeData}`, () => {
    it('should scrape the competitors', async () => {
      const entityName = 'Google';
      const entityType = EconomicEntityType.Business;
      const operationType = CollectionOperationType.ScrapeData;

      const data = {
        subject: EconomicEntityFactory.get(),
        owns: [EconomicEntityFactory.get()],
        competitors: [EconomicEntityFactory.get()],
        products: [EconomicEntityFactory.get()],
        services: [EconomicEntityFactory.get()],
        executives: [EconomicEntityFactory.get()],
        sectors: [
          EconomicSectorFactory.get({
            type: EconomicSectorType.InformationTechnology,
          }),
        ],
      };

      const response = await execute(
        modulePath,
        [
          `--entity-name=${entityName}`,
          `--entity-type=${entityType}`,
          `--operation-type=${operationType}`,
          '--mock-run',
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

      const data = {
        subject: EconomicEntityFactory.get(),
        owns: [EconomicEntityFactory.get()],
        competitors: [EconomicEntityFactory.get()],
        products: [EconomicEntityFactory.get()],
        services: [EconomicEntityFactory.get()],
        executives: [EconomicEntityFactory.get()],
        sectors: [
          EconomicSectorFactory.get({
            type: EconomicSectorType.InformationTechnology,
          }),
        ],
      };

      const response = await execute(
        modulePath,
        [
          `--entity-name=${entityName}`,
          `--entity-type=${entityType}`,
          `--operation-type=${operationType}`,
          '--mock-run',
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

      const data = {
        subject: EconomicEntityFactory.get(),
        owns: [EconomicEntityFactory.get()],
        competitors: [EconomicEntityFactory.get()],
        products: [EconomicEntityFactory.get()],
        services: [EconomicEntityFactory.get()],
        executives: [EconomicEntityFactory.get()],
        sectors: [
          EconomicSectorFactory.get({
            type: EconomicSectorType.InformationTechnology,
          }),
        ],
      };

      const response = await execute(
        modulePath,
        [
          `--entity-name=${entityName}`,
          `--entity-type=${entityType}`,
          `--operation-type=${operationType}`,
          '--mock-run',
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

      const data = {
        subject: EconomicEntityFactory.get(),
        owns: [EconomicEntityFactory.get()],
        competitors: [EconomicEntityFactory.get()],
        products: [EconomicEntityFactory.get()],
        services: [EconomicEntityFactory.get()],
        executives: [EconomicEntityFactory.get()],
        sectors: [
          EconomicSectorFactory.get({
            type: EconomicSectorType.InformationTechnology,
          }),
        ],
      };

      const response = await execute(
        modulePath,
        [
          `--entity-name=${entityName}`,
          `--entity-type=${entityType}`,
          `--operation-type=${operationType}`,
          '--mock-run',
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

      const data = {
        subject: EconomicEntityFactory.get(),
        owns: [EconomicEntityFactory.get()],
        competitors: [EconomicEntityFactory.get()],
        products: [EconomicEntityFactory.get()],
        services: [EconomicEntityFactory.get()],
        executives: [EconomicEntityFactory.get()],
        sectors: [
          EconomicSectorFactory.get({
            type: EconomicSectorType.InformationTechnology,
          }),
        ],
      };

      const response = await execute(
        modulePath,
        [
          `--entity-name=${entityName}`,
          `--entity-type=${entityType}`,
          `--operation-type=${operationType}`,
          '--mock-run',
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

      const data = {
        subject: EconomicEntityFactory.get(),
        owns: [EconomicEntityFactory.get()],
        competitors: [EconomicEntityFactory.get()],
        products: [EconomicEntityFactory.get()],
        services: [EconomicEntityFactory.get()],
        executives: [EconomicEntityFactory.get()],
        sectors: [
          EconomicSectorFactory.get({
            type: EconomicSectorType.InformationTechnology,
          }),
        ],
      };

      const response = await execute(
        modulePath,
        [
          `--entity-name=${entityName}`,
          `--entity-type=${entityType}`,
          `--operation-type=${operationType}`,
          '--mock-run',
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
