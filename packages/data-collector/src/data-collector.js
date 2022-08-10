import {
  EconomicEntityFactory,
  EconomicEntityType,
  CollectionOperationType,
} from '@thinkdeep/model';
import {validString} from '@thinkdeep/util';
import {Client} from './client.js';
import {Command, Option} from 'commander';
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
      '-n, --entity-name <entity name>',
      'Specify the name of the economic entity for which the operation will be performed.'
    )
  );

  program.addOption(
    new Option(
      '-t, --entity-type <entity type>',
      'Specify the type of the economic entity for which the operation will be performed.'
    ).choices(['BUSINESS'])
  );

  program.addOption(
    new Option(
      '-o, --operation-type <operation type>',
      'Specify the type of data collection operation you would like to execute.'
    ).choices(CollectionOperationType.types())
  );

  program.addOption(
    new Option(
      '-m, --num-tweets [num tweets]',
      'Specify the number of tweets to be fetched at once.'
    ).default(10, 'The default number to fetch.')
  );

  program.addOption(new Option('--mock-run', 'Trigger mocking of the cli.'));

  program.parse(process.argv);

  const options = program.opts();

  if (!validString(options.operationType))
    throw new Error('Operation type is required');

  if (!validString(options.entityName))
    throw new Error(`Entity name is required`);

  if (!validString(options.entityType))
    throw new Error(`Entity type is required`);

  if (!EconomicEntityType.valid(options.entityType))
    throw new Error(`Entity type ${options.entityType} is invalid.`);

  const economicEntity = EconomicEntityFactory.get({
    name: options.entityName,
    type: options.entityType,
  });

  const currentUtcDateTime = moment().utc().format();

  let kafkaClient;
  if (!options.mockRun) {
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
      const twitterClient = !options.mockRun
        ? new TwitterApi(process.env.PREDECOS_TWITTER_BEARER).readOnly
        : {
            v2: {
              get: sinon.stub().returns({
                data: [
                  {
                    text: 'tweet 1',
                  },
                  {
                    text: 'tweet 2',
                  },
                  {
                    text: 'tweet 3',
                  },
                ],
              }),
            },
          };

      const collectDataClient = new Client(twitterClient, kafkaClient, logger);

      (async () => {
        logger.info('Connecting to data collection client.');
        await collectDataClient.connect();

        const recentTweets = await collectDataClient.fetchRecentTweets({
          query: `${options.entityName} lang:en -is:retweet`,
          max_results: options.numTweets,
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
