import {EconomicEntityFactory, CollectionOperationType} from '@thinkdeep/model';
import {validString} from '@thinkdeep/util';
import {Client} from './client.js';
import {Command, Option} from 'commander';
import {DataScraper} from './data-scraper.js';
import {Kafka} from 'kafkajs';
import log4js from 'log4js';
import moment from 'moment';
import sinon from 'sinon';
import {TwitterApi} from 'twitter-api-v2';

const logger = log4js.getLogger();
logger.level = 'debug';

try {
  const program = new Command();

  program
    .name('collect-data')
    .description('Collect data using the specified operation.');

  program.addOption(
    new Option(
      '-e, --economic-entity <economic entity>',
      `Specify the economic entity (i.e, '{ "name": "Google", "type": "BUSINESS"}').`
    )
  );

  program.addOption(
    new Option(
      '-o, --operation-type <operation type>',
      'Specify the type of data collection operation you would like to execute.'
    ).choices(CollectionOperationType.types)
  );

  program.addOption(
    new Option(
      '-l, --limit [limit]',
      'Specify the limit associated with the operation.'
    ).default(10, 'Defaults to 10.')
  );

  program.addOption(
    new Option(
      '-m, --mock-data <mock data>',
      'Trigger mocking of the cli.'
    ).default({}, 'An empty object')
  );

  program.parse(process.argv);

  const options = program.opts();

  const economicEntity = EconomicEntityFactory.get(
    JSON.parse(options.economicEntity)
  );

  if (!validString(options.operationType))
    throw new Error('Operation type is required');

  const currentUtcDateTime = moment().utc().format();

  let kafkaClient;
  if (!options.mockData || Object.keys(options.mockData).length <= 0) {
    logger.info(`Creating kafka client.`);
    kafkaClient = new Kafka({
      clientId: 'collect-data',
      brokers: [
        `${process.env.PREDECOS_KAFKA_HOST}:${process.env.PREDECOS_KAFKA_PORT}`,
      ],
    });
  } else {
    logger.info(`Creating mock kafka client.`);
    kafkaClient = {
      admin: sinon.stub().returns({
        connect: sinon.stub(),
        createTopics: sinon.stub(),
        disconnect: sinon.stub(),
      }),
      producer: sinon.stub().returns({
        connect: sinon.stub(),
        send: sinon.stub(),
        disconnect: sinon.stub(),
      }),
    };
  }

  switch (options.operationType) {
    case CollectionOperationType.FetchTweets: {
      logger.info('Fetching tweets.');
      const twitterClient = !options.mockData
        ? new TwitterApi(process.env.PREDECOS_TWITTER_BEARER).readOnly
        : {
            v2: {
              get: sinon.stub().returns({
                data: JSON.parse(options.mockData),
              }),
            },
          };

      const collectDataClient = new Client(twitterClient, kafkaClient, logger);

      (async () => {
        logger.info('Connecting to data collection client.');
        await collectDataClient.connect();

        const recentTweets = await collectDataClient.fetchRecentTweets({
          query: `${options.entityName} lang:en -is:retweet`,
          max_results: options.limit,
        });
        logger.debug(
          `Retrieved the following tweets: ${JSON.stringify(recentTweets)}`
        );

        const data = {
          utcDateTime: currentUtcDateTime,
          economicEntity: economicEntity.toObject(),
          tweets: recentTweets,
        };

        await collectDataClient.emitEvent('TWEETS_FETCHED', data);

        process.exit(0);
      })();

      break;
    }
    case CollectionOperationType.ScrapeData: {
      (async () => {
        logger.info(
          `Scraping data for ${economicEntity.type} ${economicEntity.name}.`
        );
        const scraper =
          !options.mockData || Object.keys(options.mockData).length <= 0
            ? new DataScraper(logger)
            : sinon.createStubInstance(DataScraper);

        await scraper.scrapeData(economicEntity);

        // const data = {
        //   utcDateTime: currentUtcDateTime,
        //   economicEntity: economicEntity.toObject(),
        //   data: scrapedData,
        // };

        // await collectDataClient.emitEvent('DATA_SCRAPED', data);
      })();

      break;
    }
    default: {
      throw new Error(
        `The specified operation ${options.operationType} isn't yet supported.`
      );
    }
  }
} catch (e) {
  logger.error(e.message.toString());
  throw e;
}
