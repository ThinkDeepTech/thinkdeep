import { CollectDataClient } from "./collect-data-client.mjs";
import { Command, Option } from "commander";
import { Kafka } from 'kafkajs';
import log4js from "log4js";
import sinon from 'sinon';
import { TwitterApi } from 'twitter-api-v2';

const logger = log4js.getLogger();
logger.level = "debug";

try {

    const program = new Command();

    program.name('collect-data')
            .description('Collect data using the specified operation.');

    program.addOption(
        new Option('-n, --entity-name <entity name>', 'Specify the name of the economic entity for which the operation will be performed.')
    );

    program.addOption(
        new Option('-t, --entity-type <entity type>', 'Specify the type of the economic entity for which the operation will be performed.')
            .choices(['BUSINESS'])
    );

    program.addOption(
        new Option('-o, --operation-type <operation type>', 'Specify the type of data collection operation you would like to execute.')
            .choices(['fetch-tweets'])
    );

    program.addOption(
        new Option('-m, --num-tweets [num tweets]', 'Specify the number of tweets to be fetched at once.')
            .default(10, 'The default number to fetch.')
    );

    program.addOption(
        new Option('--mock-run', 'Trigger mocking of the cli.')
    );

    program.parse(process.argv);

    const options = program.opts();

    if(!options.entityName)
        throw new Error(`Entity name is required`);

    if(!options.entityType)
        throw new Error(`Entity type is required`);

    if(!options.operationType)
        throw new Error('Operation type is required');

    switch(options.operationType) {
        case 'fetch-tweets': {

            logger.info('Fetching tweets.');
            let twitterClient;
            let kafkaClient;
            if (!options.mockRun) {
                twitterClient = (new TwitterApi(process.env.PREDECOS_TWITTER_BEARER)).readOnly;

                kafkaClient = new Kafka({
                    clientId: 'collect-data',
                    brokers: [`${process.env.PREDECOS_KAFKA_HOST}:${process.env.PREDECOS_KAFKA_PORT}`]
                });
            } else {
                twitterClient = {
                    v2: {
                        get: sinon.stub().returns({
                            data: [{
                                text: 'tweet 1'
                            }, {
                                text: 'tweet 2'
                            }, {
                                text: 'tweet 3'
                            }]
                        })
                    }
                };
                kafkaClient = {
                    admin: sinon.stub().returns({
                        connect: sinon.stub(),
                        createTopics: sinon.stub(),
                        disconnect: sinon.stub()
                    }),
                    producer: sinon.stub().returns({
                        connect: sinon.stub(),
                        send: sinon.stub(),
                        disconnect: sinon.stub()
                    })
                };
            }

            const collectDataClient = new CollectDataClient(twitterClient, kafkaClient, logger);

            ( async () => {

                logger.info('Connecting to data collection client.');
                await collectDataClient.connect();

                const recentTweets = await collectDataClient.fetchRecentTweets({
                    query: `${options.entityName} lang:en -is:retweets`,
                    max_results: options.numTweets
                });
                logger.debug(`Retrieved the following tweets: ${JSON.stringify(recentTweets)}`);

                const data = {
                    economicEntityName: options.entityName,
                    economicEntityType: options.entityType,
                    tweets: recentTweets
                };

                await collectDataClient.emitEvent('TWEETS_FETCHED', data);

                process.exit(0);
            })();

            break;
        }
    }

} catch (e) {
    logger.error(e.message.toString());
    throw e;
}