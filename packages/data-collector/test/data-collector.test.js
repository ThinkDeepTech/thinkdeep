import chai from 'chai';
import {execute} from './execute.js';

const expect = chai.expect;

describe('data-collector', () => {
  /**
   * NOTE: This path is relative to the current working directory which, when tests are executed,
   * is the root of the project.
   */
  const modulePath = './src/data-collector.js';

  it('should require the entity name', async () => {
    const entityType = 'BUSINESS';
    const operationType = 'fetch-tweets';

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
    const operationType = 'fetch-tweets';

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
    const entityType = 'BUSINESS';

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

  describe('fetch-tweets', () => {
    it('should fetch tweets from the twitter API', async () => {
      const entityName = 'Google';
      const entityType = 'BUSINESS';
      const operationType = 'fetch-tweets';

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
      const entityType = 'BUSINESS';
      const operationType = 'fetch-tweets';

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
});
