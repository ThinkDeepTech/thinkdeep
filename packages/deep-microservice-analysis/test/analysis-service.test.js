import chai from 'chai';
import sinon from 'sinon';
import sinonChai from 'sinon-chai';

import { AnalysisService } from '../src/analysis-service.js';
const expect = chai.expect;
chai.use(sinonChai);

describe('analysis-service', () => {

    let analysisDataStore;
    let sentimentLib;
    let logger;
    let kafkaClient;
    let admin;
    let consumer;
    let producer;
    let subject;
    beforeEach(() => {
        analysisDataStore = {
            readMostRecentSentiments: sinon.stub(),
            createSentiments: sinon.stub()
        };
        sentimentLib = {
            analyze: sinon.stub()
        };
        admin = {
            createTopics: sinon.stub(),
            connect: sinon.stub(),
            disconnect: sinon.stub()
        };
        consumer = {
            subscribe: sinon.stub().returns(Promise.resolve()),
            run: sinon.stub().returns(Promise.resolve()),
            connect: sinon.stub(),
            disconnect: sinon.stub()
        };
        producer = {
            send: sinon.stub(),
            connect: sinon.stub(),
            disconnect: sinon.stub()
        };
        logger = {
            debug: sinon.stub(),
            info: sinon.stub(),
            warn: sinon.stub(),
            error: sinon.stub()
        }
        kafkaClient = {
            admin: sinon.stub().returns(admin),
            producer: sinon.stub().returns(producer),
            consumer: sinon.stub().returns(consumer)
        };
        subject = new AnalysisService(analysisDataStore, sentimentLib, kafkaClient, logger);
    });

    describe('constructor', () => {

        it('should create a kafka admin', () => {
            expect(kafkaClient.admin.callCount).to.be.greaterThan(0);
        })

        it('should create a kafka producer', () => {
            expect(kafkaClient.producer.callCount).to.be.greaterThan(0);
        })

        it('should create a kafka consumer', () => {
            expect(kafkaClient.consumer.callCount).to.be.greaterThan(0);
        })

        it('should assign the consumer to a consumer group', () => {
            const args = kafkaClient.consumer.getCall(0).args;
            expect(args[0].groupId).not.to.equal(undefined);
            expect(args[0].groupId).not.to.equal(null);
            expect(args[0].groupId).not.to.equal('');
        })
    })

    describe('connect', () => {

        it('should subscribe to receive updates when tweets are collected', async () => {
            await subject.connect();
            const subscriptionOptions = consumer.subscribe.getCall(0).args[0];
            expect(subscriptionOptions.topic).to.equal('TWEETS_COLLECTED');
        })

        it('should read all tweets that have collected', async () => {
            await subject.connect();
            const subscriptionOptions = consumer.subscribe.getCall(0).args[0];
            expect(subscriptionOptions.fromBeginning).to.equal(true);
        })

        it('should compute the sentiment of each set of tweets collected', async () => {
            const message1 = {
                value: {
                    economicEntityName: 'google',
                    economicEntityType: 'BUSINESS',
                    timeSeriesItems: [{
                        timestamp: 1,
                        tweets: [{
                            text: 'Text'
                        }]
                    }]
                }
            };
            const message2 = {
                value: {
                    economicEntityName: 'google',
                    economicEntityType: 'BUSINESS',
                    timeSeriesItems: [{
                        timestamp: 1,
                        tweets: [{
                            text: 'something'
                        }, {
                            text: 'third text value'
                        }]
                    }]
                }
            };

            message1.value.toString = () => {
                return JSON.stringify(message1.value);
            }

            message2.value.toString = () => {
                return JSON.stringify(message2.value);
            }

            const sentimentResult = {
                score: 1
            };
            sentimentLib.analyze.returns(sentimentResult);

            await subject.connect();
            const options = consumer.run.getCall(0).args[0];
            const messageProcessor = options.eachMessage;

            await messageProcessor({message: message1});
            await messageProcessor({message: message2});

            expect(sentimentLib.analyze.callCount).to.equal(3);
        })

        it('should wait for topic creation', async () => {

            await subject.connect();

            const adminArg = admin.createTopics.getCall(0).args[0];
            expect(admin.createTopics.callCount).to.equal(1);
            expect(adminArg.waitForLeaders).to.equal(true);
        })
    })

    describe('sentiments', () => {

        it('should return an empty object if economic entity name is empty', async () => {
            const economicEntityName = "";
            const economicEntityType = "BUSINESS";
            const user = { scope: "read:all" };
            const response = await subject.sentiments(economicEntityName, economicEntityType, user);
            expect(Object.keys(response).length).to.equal(0);
        })

        it('should return an empty object if economic entity name is not a string', async () => {
            const economicEntityName = {};
            const economicEntityType = "BUSINESS";
            const user = { scope: "read:all" };
            const response = await subject.sentiments(economicEntityName, economicEntityType, user);
            expect(Object.keys(response).length).to.equal(0);
        })

        it('should return an empty object if economic entity type is empty', async () => {
            const economicEntityName = "SomeBusinessName";
            const economicEntityType = "";
            const user = { scope: "read:all" };
            const response = await subject.sentiments(economicEntityName, economicEntityType, user);
            expect(Object.keys(response).length).to.equal(0);
        })

        it('should return an empty object if economic entity type is not a string', async () => {
            const economicEntityName = "SomeBusinessName";
            const economicEntityType = [];
            const user = { scope: "read:all" };
            const response = await subject.sentiments(economicEntityName, economicEntityType, user);
            expect(Object.keys(response).length).to.equal(0);
        })

        it('should return an empty object if the user does not have read:all scope', async () => {
            const economicEntityName = "SomeBusinessName";
            const economicEntityType = "BUSINESS";
            const user = { scope: "profile email" };
            const response = await subject.sentiments(economicEntityName, economicEntityType, user);
            expect(Object.keys(response).length).to.equal(0);
        })

        it('should successfully execute if the user has read:all scope', async () => {
            const economicEntityName = "SomeBusinessName";
            const economicEntityType = "BUSINESS";
            const user = { scope: "profile email read:all" };
            const tweets = [{
                text: 'unimportant'
            }];
            const databaseData = {
                timestamp: 1,
                score: 1,
                tweets
            };
            analysisDataStore.readMostRecentSentiments.returns(databaseData);

            await subject.sentiments(economicEntityName, economicEntityType, user);

            expect(analysisDataStore.readMostRecentSentiments.callCount).to.equal(1);
        })

        it('should fetch data from the database', async () => {
            const economicEntityName = "SomeBusinessName";
            const economicEntityType = "BUSINESS";
            const user = { scope: "profile email read:all" };
            const tweets = [{
                text: 'unimportant'
            }];
            const databaseData = {
                timestamp: 1,
                score: 1,
                tweets
            };
            analysisDataStore.readMostRecentSentiments.returns(databaseData);

            await subject.sentiments(economicEntityName, economicEntityType, user);

            expect(analysisDataStore.readMostRecentSentiments.callCount).to.equal(1);
        })

    });

    describe('_computeSentiment', () => {

        it('should return an empty object if economic entity name is empty', async () => {
            const economicEntityName = "";
            const economicEntityType = "BUSINESS";
            const timeSeriesData = [{
                timestamp: 1,
                economicEntityName: 'irrelevant',
                economicEntityType: 'irrelevant',
                tweets: [{
                    text: 'something random'
                }]
            }];

            await subject._computeSentiment(economicEntityName, economicEntityType, timeSeriesData);
            expect(logger.info.callCount).to.equal(0);
        })

        it('should return an empty object if economic entity name is not a string', async () => {
            const economicEntityName = {};
            const economicEntityType = "BUSINESS";
            const timeSeriesData = [{
                timestamp: 1,
                economicEntityName: 'irrelevant',
                economicEntityType: 'irrelevant',
                tweets: [{
                    text: 'something random'
                }]
            }];

            await subject._computeSentiment(economicEntityName, economicEntityType, timeSeriesData);
            expect(logger.info.callCount).to.equal(0);
        })

        it('should return an empty object if economic entity type is empty', async () => {
            const economicEntityName = "SomeBusinessName";
            const economicEntityType = "";
            const timeSeriesData = [{
                timestamp: 1,
                economicEntityName: 'irrelevant',
                economicEntityType: 'irrelevant',
                tweets: [{
                    text: 'something random'
                }]
            }];

            await subject._computeSentiment(economicEntityName, economicEntityType, timeSeriesData);
            expect(logger.info.callCount).to.equal(0);
        })

        it('should return an empty object if economic entity type is not a string', async () => {
            const economicEntityName = "SomeBusinessName";
            const economicEntityType = [];
            const timeSeriesData = [{
                timestamp: 1,
                economicEntityName: 'irrelevant',
                economicEntityType: 'irrelevant',
                tweets: [{
                    text: 'something random'
                }]
            }];

            await subject._computeSentiment(economicEntityName, economicEntityType, timeSeriesData);
            expect(logger.info.callCount).to.equal(0);
        })

        it('should return if there are no time series entries', async () => {
            const economicEntityName = "SomeBusinessName";
            const economicEntityType = 'BUSINESS';
            const timeSeriesData = [];

            await subject._computeSentiment(economicEntityName, economicEntityType, timeSeriesData);
            expect(logger.info.callCount).to.equal(0);
        })

        it('should compute the sentiment for each tweet entry', async () => {
            const economicEntityName = "SomeBusinessName";
            const economicEntityType = "BUSINESS";
            const tweets = [{
                    text: 'something'
                }, {
                    text: 'something else'
                }];
            const timeSeriesData = [{
                timestamp: 1,
                economicEntityName: 'irrelevant',
                economicEntityType: 'irrelevant',
                tweets
            }];

            const sentimentResult = {
                score: 1
            };
            sentimentLib.analyze.returns(sentimentResult);

            await subject._computeSentiment(economicEntityName, economicEntityType, timeSeriesData);

            expect(sentimentLib.analyze.callCount).to.be.greaterThan(0);
        })

        it('should skip over entries that include a null value for tweets ', async () => {
            const economicEntityName = "SomeBusinessName";
            const economicEntityType = "BUSINESS";
            const tweets = null;
            const timeSeriesData = [{
                timestamp: 1,
                economicEntityName: 'irrelevant',
                economicEntityType: 'irrelevant',
                tweets
            }];

            const sentimentResult = {
                score: 1
            };
            sentimentLib.analyze.returns(sentimentResult);

            await subject._computeSentiment(economicEntityName, economicEntityType, timeSeriesData);

            expect(sentimentLib.analyze.callCount).to.equal(0);
        })

        it('should skip over entries that include an empty tweets array ', async () => {
            const economicEntityName = "SomeBusinessName";
            const economicEntityType = "BUSINESS";
            const tweets = [];
            const timeSeriesData = [{
                timestamp: 1,
                economicEntityName: 'irrelevant',
                economicEntityType: 'irrelevant',
                tweets
            }];

            const sentimentResult = {
                score: 1
            };
            sentimentLib.analyze.returns(sentimentResult);

            await subject._computeSentiment(economicEntityName, economicEntityType, timeSeriesData);

            expect(sentimentLib.analyze.callCount).to.equal(0);
        })

        it('should add a message to the queue indicating the sentiments computed', async () => {
            const economicEntityName = "SomeBusinessName";
            const economicEntityType = "BUSINESS";
            const tweets = [{
                    text: 'something'
                }, {
                    text: 'something else'
                }];
            const timeSeriesData = [{
                timestamp: 1,
                economicEntityName: 'irrelevant',
                economicEntityType: 'irrelevant',
                tweets
            }];

            const sentimentResult = {
                score: 1
            };
            sentimentLib.analyze.returns(sentimentResult);

            await subject._computeSentiment(economicEntityName, economicEntityType, timeSeriesData);

            const sendArg = producer.send.getCall(0).args[0];
            const sentEvent = JSON.parse(sendArg.messages[0].value);
            expect(sendArg.topic).to.equal('TWEET_SENTIMENT_COMPUTED');
            expect(sentEvent.economicEntityName).to.equal(economicEntityName);
            expect(sentEvent.economicEntityType).to.equal(economicEntityType);
            expect(sentEvent.sentiments[0].score).to.equal(tweets.length * sentimentResult.score / tweets.length);

            const eventTweets = sentEvent.sentiments[0].tweets;
            expect(eventTweets[0].text).to.equal(tweets[0].text);
            expect(eventTweets[1].text).to.equal(tweets[1].text);

        })
    })

    describe('_averageSentiment', () => {

        it('should compute the average sentiment', () => {
            const data = {
                timestamp: 1,
                tweets: [{
                    text: 'sometext'
                }, {
                    text: 'some other text'
                }]
            };
            const firstScore = 4;
            const secondScore = 5;
            sentimentLib.analyze.onCall(0).returns({ score: firstScore });
            sentimentLib.analyze.onCall(1).returns({ score: secondScore })

            const result = subject._averageSentiment(data);

            expect(result.score).to.equal((firstScore + secondScore) / data.tweets.length);
        })

        it('should add the timestamp to the response', () => {
            const data = {
                timestamp: 1,
                tweets: []
            };

            const result = subject._averageSentiment(data);

            expect(result.timestamp).to.equal(1);
        })

        it('should convert the tweet text to lowercase so that sentiment is case-insensitive', () => {
            const data = {
                timestamp: 1,
                tweets: [{
                    text: 'SomeText'
                }, {
                    text: 'SoMe OTher text'
                }]
            };
            sentimentLib.analyze.returns({ score: 1 });

            subject._averageSentiment(data);

            const firstPassArgument = sentimentLib.analyze.getCall(0).args[0];
            const secondPassArgument = sentimentLib.analyze.getCall(1).args[0];

            expect(firstPassArgument).to.equal(data.tweets[0].text.toLowerCase());
            expect(secondPassArgument).to.equal(data.tweets[1].text.toLowerCase());
        })
    })

    describe('_topicCreation', () => {

        it('should wait for a leader selection before returning', async () => {
            const topics = ['SOME_TOPIC'];

            await subject._topicCreation(topics);

            const options = admin.createTopics.getCall(0).args[0];
            expect(options.waitForLeaders).to.equal(true);
        })

        it('should warn the user when an error occurs', async () => {
            const topics = ['SOME_TOPIC'];

            admin.createTopics.throws();

            await subject._topicCreation(topics);

            expect(logger.warn.callCount).to.be.greaterThan(0);
        })
    })
})