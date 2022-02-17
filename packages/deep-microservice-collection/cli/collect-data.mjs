import { Command, Option } from "commander";
import { Kafka } from 'kafkajs';
import { TwitterApi } from 'twitter-api-v2';

debugger;

try {

    const program = new Command();

    program.name('collect-data')
            .description('Collect data using the specified operation.');

    program.addOption(
        new Option('-o, --operation-type <operation type>', 'Specify the type of data collection operation you would like to execute.')
            .choices(['fetch-tweets'])
    );

    program.requiredOption('-n, --entity-name <entity name>', 'Specify the name of the economic entity for which the operation will be performed.');

    program.addOption(
        new Option('-t, --entity-type <entity type>', 'Specify the type of the economic entity for which the operation will be performed.')
            .choices(['business'])
    );

    program.parse(process.argv);

    const options = program.opts();

    if (!options.operationType)
        throw new Error('An operation type is required.');

    if (!options.entityType)
        throw new Error('An entity type is required');

    if (options.operationType) {

        switch(options.operationType) {
            case 'fetch-tweets': {
                console.log(options.operationType)

                const fetchTweets = async () => {

                    // Fetch data from the api
                    const twitterClient = new TwitterApi(process.env.PREDECOS_TWITTER_BEARER);
                    const readOnlyClient = twitterClient.readOnly;

                    debugger;

                    const tweets = await readOnlyClient.v2.get('tweets/search/recent', {
                        query: `${options.entityName} lang:en`,
                        max_results: 10
                    });

                    console.log(`Collected tweets: ${JSON.stringify(tweets)}`);

                    const kafka = new Kafka({
                        clientId: 'collect-data',
                        brokers: [`${process.env.PREDECOS_KAFKA_HOST}:${process.env.PREDECOS_KAFKA_PORT}`]
                    });

                    debugger;

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

                    console.log('Connecting to kafka.');

                    await admin.connect();
                    await producer.connect();


                    console.log('Creating TWEET_FETCHED kafka topic.');
                    // Add data to kafka topic
                    await admin.createTopics({
                        waitForLeaders: true,
                        topics: [{
                            topic: 'TWEET_FETCHED',
                            replicationFactor: 1
                        }]
                    });

                    const event = {
                        economicEntityName: options.entityName,
                        economicEntityType: options.entityType,
                        tweets
                    };

                    console.log('Sending TWEET_FETCHED event into stream.');
                    producer.send({
                        topic: 'TWEET_FETCHED',
                        messages: [
                            { value: JSON.stringify(event) }
                        ]
                    });
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
    console.error(e.message.toString());
}