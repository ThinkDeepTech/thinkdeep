import { Command, Option } from "commander";
import { Kafka } from 'kafkajs';
import log4js from "log4js";
import { TwitterApi } from 'twitter-api-v2';

const logger = log4js.getLogger();
logger.level = "debug";

try {

    const program = new Command();

    program.name('collect-data')
            .description('Collect data using the specified operation.');

    program.addOption(
        new Option('-o, --operation-type <operation type>', 'Specify the type of data collection operation you would like to execute.')
            .choices(['fetch-tweets'])
    );

    program.addOption(
        new Option('-n, --entity-name <entity name>', 'Specify the name of the economic entity for which the operation will be performed.')
    );

    program.addOption(
        new Option('-m, --num-tweets [num tweets]', 'Specify the number of tweets to be fetched at once.')
            .default(10, 'The default number to fetch.')
    );

    program.addOption(
        new Option('-t, --entity-type <entity type>', 'Specify the type of the economic entity for which the operation will be performed.')
            .choices(['business'])
    );

    program.parse(process.argv);

    const options = program.opts();

    if (options.operationType) {

        switch(options.operationType) {
            case 'fetch-tweets': {

                const fetchTweets = async () => {

                    // Fetch data from the api
                    const twitterClient = new TwitterApi(process.env.PREDECOS_TWITTER_BEARER);
                    const readOnlyClient = twitterClient.readOnly;

                    const tweets = await readOnlyClient.v2.get('tweets/search/recent', {
                        query: `${options.entityName} lang:en`,
                        max_results: options.numTweets
                    });

                    console.log(`Collected tweets: ${JSON.stringify(tweets)}`);

                    const kafka = new Kafka({
                        clientId: 'collect-data',
                        brokers: [`${process.env.PREDECOS_KAFKA_HOST}:${process.env.PREDECOS_KAFKA_PORT}`]
                    });

                    const admin = kafka.admin();
                    const producer = kafka.producer();

                    const performCleanup = async () => {
                        await producer.disconnect();
                        await admin.disconnect();
                    };

                    const attachExitHandler = async (callback) => {
                        process.on('cleanup', callback);
                        process.on('exit', () => {
                        process.emit('cleanup');
                        });
                        process.on('SIGINT', () => {
                        process.exit(2);
                        });
                        process.on('uncaughtException', () => {
                        process.exit(99);
                        });
                    };

                    attachExitHandler(performCleanup);

                    logger.debug('Connecting to kafka.');

                    await admin.connect();
                    await producer.connect();

                    logger.info('Creating kafka topic.');
                    await admin.createTopics({
                        waitForLeaders: true,
                        topics: [{
                            topic: 'TWEETS_FETCHED',
                            replicationFactor: 1
                        }]
                    });

                    const event = {
                        economicEntityName: options.entityName,
                        economicEntityType: options.entityType,
                        tweets
                    };

                    logger.info('Sending event into stream.');
                    await producer.send({
                        topic: 'TWEETS_FETCHED',
                        messages: [
                            { value: JSON.stringify(event) }
                        ]
                    });

                    process.exit(0);
                };
                fetchTweets();
                break;
            }
            default: {
                throw new Error('Operation type is required.');
                break;
            }
        }
    }

} catch (e) {
    logger.error(e.message.toString());
}