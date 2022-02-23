import k8s from '@kubernetes/client-node';

import chai from 'chai';
import sinon from 'sinon';
import sinonChai from 'sinon-chai';
const expect = chai.expect;
chai.use(sinonChai);

import { CollectionService } from '../src/collection-service.mjs';

describe('collection-service', () => {

    const memoizedEconomicEntities = [{
        name: 'firstbusiness',
        type: 'BUSINESS'
    }, {
        name: 'secondbusiness',
        type: 'BUSINESS'
    }];

    let tweetStore;
    let economicEntityMemo;
    let commander;
    let admin;
    let producer;
    let consumer;
    let mockK8s;
    let logger;
    let subject;
    beforeEach(() => {

        tweetStore = {
            createTweets: sinon.stub(),
            readRecentTweets: sinon.stub()
        };

        logger = {
            debug: sinon.stub(),
            info: sinon.stub(),
            warn: sinon.stub(),
            error: sinon.stub()
        };

        economicEntityMemo = {
            collectingData: sinon.stub(),
            memoizeDataCollection: sinon.stub(),
            readEconomicEntities: sinon.stub(),
            _readMemo: sinon.stub()
        };

        economicEntityMemo.readEconomicEntities.returns( Promise.resolve( memoizedEconomicEntities ))
        economicEntityMemo.collectingData.returns( true );

        commander = {
            execute: sinon.stub(),
            stopAllCommands: sinon.stub()
        };

        admin = {
            createTopics: sinon.stub().returns(Promise.resolve())
        };

        producer = {
            send: sinon.stub()
        };

        consumer = {
            subscribe: sinon.stub(),
            run: sinon.stub()
        }

        consumer.subscribe.returns( Promise.resolve() );
        consumer.run.returns( Promise.resolve() );

        mockK8s = {
            V1CronJob: sinon.stub(),
            V1ObjectMeta: sinon.stub(),
            V1CronJobSpec: sinon.stub(),
            V1JobTemplateSpec: sinon.stub(),
            V1JobSpec: sinon.stub(),
            V1PodTemplateSpec: sinon.stub(),
            V1PodSpec: sinon.stub(),
            V1LocalObjectReference: sinon.stub(),
            V1Container: sinon.stub(),
            V1EnvFromSource: sinon.stub(),
            V1SecretEnvSource: sinon.stub(),
            KubeConfig: sinon.stub()
        };

        mockK8s.V1CronJob.returns( sinon.createStubInstance(k8s.V1CronJob.constructor) );
        mockK8s.V1CronJobSpec.returns( sinon.createStubInstance(k8s.V1CronJobSpec.constructor) );
        mockK8s.V1JobTemplateSpec.returns( sinon.createStubInstance(k8s.V1JobTemplateSpec.constructor) );
        mockK8s.V1JobSpec.returns( sinon.createStubInstance(k8s.V1JobSpec.constructor) );
        mockK8s.V1PodTemplateSpec.returns( sinon.createStubInstance(k8s.V1PodTemplateSpec.constructor) );
        mockK8s.V1PodSpec.returns( sinon.createStubInstance(k8s.V1PodSpec.constructor) );
        mockK8s.V1EnvFromSource.returns( sinon.createStubInstance(k8s.V1EnvFromSource.constructor) );

        /**
         * NOTE: Oddly, createStubInstance seems to be creating an object with a readonly name
         * property. Therefore, I have to overwrite that for the tests to run properly. The system
         * works properly when deployed.
         */
        const metadata = sinon.createStubInstance(k8s.V1ObjectMeta.constructor);
        Object.defineProperty(metadata, "name", { writable: true });
        mockK8s.V1ObjectMeta.returns( metadata );

        const container = sinon.createStubInstance(k8s.V1Container.constructor);
        Object.defineProperty(container, "name", { writable: true });
        mockK8s.V1Container.returns( sinon.createStubInstance(k8s.V1Container.constructor) );

        const secretRef = sinon.createStubInstance(k8s.V1SecretEnvSource.constructor);
        Object.defineProperty(secretRef, "name", { writable: true });
        mockK8s.V1SecretEnvSource.returns( secretRef );

        const dockerSecret = sinon.createStubInstance(k8s.V1LocalObjectReference.constructor);
        Object.defineProperty(dockerSecret, "name", { writable: true });
        mockK8s.V1LocalObjectReference.returns( dockerSecret );


        const k8sApiClient = {
            createNamespacedCronJob: sinon.stub(),
            deleteCollectionNamespacedCronJob: sinon.stub()
        }
        const kubeConfig = sinon.createStubInstance(k8s.KubeConfig.constructor);
        kubeConfig.loadFromCluster = sinon.stub();
        kubeConfig.makeApiClient = sinon.stub().returns(k8sApiClient)
        mockK8s.KubeConfig.returns( kubeConfig );

        subject = new CollectionService(tweetStore, economicEntityMemo, commander, admin, producer, consumer, mockK8s, logger);
    });

    describe('constructor', () => {

        it('should create the tweets collected and tweets fetched topics', () => {
            const args = admin.createTopics.getCall(0).args;
            const topics = args[0].topics;
            expect(topics[0].topic).to.equal('TWEETS_COLLECTED');
            expect(topics[1].topic).to.equal('TWEETS_FETCHED');
        })

        it('should subscribe to the tweets fetched event', () => {
            const args = consumer.subscribe.getCall(0).args;
            expect(args[0].topic).to.equal('TWEETS_FETCHED');
        })

        it('should process each of the tweets fetched with its handler', async () => {
            const message = JSON.stringify({
                economicEntityName: 'Google',
                economicEntityType: 'BUSINESS',
                tweets: [{
                    text: "tweet1"
                },{
                    text: "tweet2"
                }]
            });
            const args = consumer.run.getCall(0).args;

            console.log(JSON.stringify(args));
            const perMessageCallback = args[0].eachMessage;

            await perMessageCallback({ message: {
                value: {
                    toString: () => message
                }
            }});

            expect(tweetStore.createTweets).to.have.been.called;
        })

        it('should read all of the economic entities stored', () => {
            expect(economicEntityMemo.readEconomicEntities).to.have.been.calledOnce;
        })

        it('should collect data for each memoized economic entity', () => {

            const firstCall = commander.execute.getCall(0);
            const secondCall = commander.execute.getCall(1);

            expect(firstCall.args[0]).to.equal('firstbusiness:BUSINESS');
            expect(secondCall.args[0]).to.equal('secondbusiness:BUSINESS');
        })
    })

    describe('tweets', async () => {

        it('should return [] if the economicEntityName is empty', async () => {
            const entityName = "";
            const permissions = { scope: 'read:all'};
            const result = await subject.tweets(entityName, 'business', permissions);
            expect(result.length).to.equal(0);
        })

        it('should return [] if the economicEntityName is not a string', async () => {
            const entityName = 1;
            const permissions = { scope: 'read:all'};
            const result = await subject.tweets(entityName, 'business', permissions);
            expect(result.length).to.equal(0);
        })

        it('should return [] if the economicEntityType is empty', async () => {
            const entityType = '';
            const permissions = { scope: 'read:all'};
            const result = await subject.tweets('somename', entityType, permissions);
            expect(result.length).to.equal(0);
        })

        it('should return [] if the economicEntityType is not a string', async () => {
            const entityType = {};
            const permissions = { scope: 'read:all'};
            const result = await subject.tweets('somename', entityType, permissions);
            expect(result.length).to.equal(0);
        })

        it('should return [] if the provided permissions does not have the read:all scope', async () => {
            const permissions = { scope: 'profile email'};
            const result = await subject.tweets('somename', 'business', permissions);
            expect(result.length).to.equal(0);
        })

        it('should read the tweets if the permissions has read:all scope', async () => {
            const permissions = { scope: 'read:all'};
            await subject.tweets('somename', 'business', permissions);
            expect(tweetStore.readRecentTweets).to.have.been.called;
        })

        it('should read tweets from the store', async () => {
            const permissions = { scope: 'read:all'};
            await subject.tweets('somename', 'business', permissions);
            expect(tweetStore.readRecentTweets).to.have.been.called;
        })
    })

    describe('collectEconomicData', () => {
        it('should indicate failure if the entityName is not specified', async () => {
            const entityName = "";
            const permissions = { scope: 'read:all'};
            const result = await subject.collectEconomicData(entityName, 'business', permissions);
            expect(result.success).to.equal(false);
        })

        it('should indicate failure if the entityName is not a string', async () => {
            const entityName = {};
            const permissions = { scope: 'read:all'};
            const result = await subject.collectEconomicData(entityName, 'business', permissions);
            expect(result.success).to.equal(false);
        })

        it('should indicate failure if the entityType is not specified', async () => {
            const entityType = '';
            const permissions = { scope: 'read:all'};
            const result = await subject.collectEconomicData('somename', entityType, permissions);
            expect(result.success).to.equal(false);
        })

        it('should indicate failure if the entityType is not a string', async () => {
            const entityType = [];
            const permissions = { scope: 'read:all'};
            const result = await subject.collectEconomicData('somename', entityType, permissions);
            expect(result.success).to.equal(false);
        })

        it('should indicate failure if the read:all scope is absent from the permissions', async () => {
            const permissions = { scope: 'email profile'};
            const result = await subject.collectEconomicData('somename', 'business', permissions);
            expect(result.success).to.equal(false);
        })

        it('should indicate failure if a permissions object is not supplied', async () => {
            const result = await subject.collectEconomicData('somename', 'business');
            expect(result.success).to.equal(false);
        })

        it('should execute the body if the permissions has read:all scope', async () => {
            const permissions = { scope: 'email profile read:all' };
            const result = await subject.collectEconomicData('somebusiness', 'business', permissions);
            expect(result.success).to.equal(true);
        })

        it('should not collect data if data is already being collected', async () => {
            const permissions = { scope: 'email profile read:all' };
            await subject.collectEconomicData('somebusiness', 'business', permissions);
            expect(economicEntityMemo.memoizeDataCollection).not.to.have.been.called;
        })

        it('should collect data if data is not being collected', async () => {
            const permissions = { scope: 'email profile read:all' };
            const entityName = 'somebusiness';
            const entityType = 'BUSINESS';
            economicEntityMemo.collectingData.returns(Promise.resolve(false));

            await subject.collectEconomicData(entityName, entityType, permissions);

            const executionKey = commander.execute.getCall(2).args[0];

            // NOTE: The constructor executes the execute command twice. So, here, we need that plus one.
            expect(commander.execute.callCount).to.equal(3);
            expect(executionKey).to.equal(`${entityName}:${entityType}`);
        })
    })

    describe('_startDataCollection', () => {

        it('should indicate failure if the entityName is not specified', async () => {
            const entityName = "";
            await subject._startDataCollection(entityName, 'business');
            expect(commander.execute).not.to.have.been.calledOnce;
        })

        it('should indicate failure if the entityName is not a string', async () => {
            const entityName = {};
            await subject._startDataCollection(entityName, 'business');
            expect(commander.execute).not.to.have.been.calledOnce;
        })

        it('should indicate failure if the entityType is not specified', async () => {
            const entityType = '';
            await subject._startDataCollection('somename', entityType);
            expect(commander.execute).not.to.have.been.calledOnce;
        })

        it('should indicate failure if the entityType is not a string', async () => {
            const entityType = [];
            await subject._startDataCollection('somename', entityType);
            expect(commander.execute).not.to.have.been.calledOnce;
        })

        it('should start collection of data', async() => {
            const entityName = 'somename';
            const entityType = 'BUSINESS';

            await subject._startDataCollection(entityName, entityType);

            expect(commander.execute.callCount).to.equal(3);
            expect(commander.execute.getCall(2).args[0]).to.equal(`${entityName}:${entityType}`);
        })
    })

    describe('_commands', () => {

        it('should perform case-insentitive comparisons', () => {
            const entityName = 'somebusiness';
            const entityType1 = 'BUSINESS';
            const entityType2 = 'bUsInEss';

            const firstCommands = subject._commands(entityName, entityType1);
            const secondCommands = subject._commands(entityName, entityType2);

            expect(firstCommands.constructor.name).not.to.equal(undefined);
            expect(firstCommands.constructor.name).to.equal(secondCommands.constructor.name);
        })

        it('should throw an error if the entity type is unknown', () => {
            const entityName = 'somebusiness';
            const entityType = 'unknownentity';

            expect(subject._commands.bind(subject, entityName, entityType)).to.throw(Error);
        })

        it('should include a repetative command to collect tweets for type business', () => {
            const entityName = 'somebusiness';
            const entityType = 'BUSINESS';

            const commands = subject._commands(entityName, entityType);
            const containers = commands[0]._cronJob.spec.jobTemplate.spec.template.spec.containers;
            const k8sCommands = containers[0].command;
            const k8sArgs = containers[0].args;

            // TODO
            expect(commands[0].constructor.name).to.equal('K8sCronJob');
            // expect(containers[0].image).to.equal('thinkdeeptech/collect-data:latest');
            // expect(k8sCommands[0]).to.equal('node');
            // expect(k8sArgs[0]).to.equal('src/collect-data.mjs');
            // expect(k8sArgs[3]).to.equal('--operation-type=fetch-tweets');
        })
    });

    describe('_handleTweetsFetched', () => {

        it('should not store the tweets if the entity name is empty', async () => {
            const tweets = [{
                text: 'sometweet'
            }, {
                text: 'another tweet'
            }]

            await subject._handleTweetsFetched('', 'BUSINESS', tweets);

            expect(tweetStore.createTweets).not.to.have.been.called;
        })

        it('should not store the tweets if the entity name is not a string', async () => {
            const tweets = [{
                text: 'sometweet'
            }, {
                text: 'another tweet'
            }]

            await subject._handleTweetsFetched({}, 'BUSINESS', tweets);

            expect(tweetStore.createTweets).not.to.have.been.called;
        })

        it('should not store the tweets if the entity type is empty', async () => {
            const tweets = [{
                text: 'sometweet'
            }, {
                text: 'another tweet'
            }]

            await subject._handleTweetsFetched('Google', '', tweets);

            expect(tweetStore.createTweets).not.to.have.been.called;
        })

        it('should not store the tweets if the entity type is not a string', async () => {
            const tweets = [{
                text: 'sometweet'
            }, {
                text: 'another tweet'
            }]

            await subject._handleTweetsFetched('Google', 1, tweets);

            expect(tweetStore.createTweets).not.to.have.been.called;
        })

        it('should not store the tweets if tweets is not an array', async () => {

            await subject._handleTweetsFetched('Google', 'BUSINESS', "notarray");

            expect(tweetStore.createTweets).not.to.have.been.called;
        })

        it('should not store the tweets if the tweets array is empty', async () => {

            await subject._handleTweetsFetched('Google', 'BUSINESS', []);

            expect(tweetStore.createTweets).not.to.have.been.called;
        })

        it('should store the tweets', async () => {
            const tweets = [{
                text: 'sometweet'
            }, {
                text: 'another tweet'
            }]
            tweetStore.createTweets.returns(true);

            await subject._handleTweetsFetched('someonebusiness', 'BUSINESS', tweets);

            expect(tweetStore.createTweets).to.have.been.called;
        })

        it('should wait for topic creation before adding to the message queue', async () => {
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

            tweetStore.readRecentTweets.returns(timeSeriesData);

            await subject._handleTweetsFetched(economicEntityName, economicEntityType, tweets);

            const adminArg = admin.createTopics.getCall(0).args[0];
            expect(admin.createTopics).to.have.been.calledOnce;
            expect(adminArg.waitForLeaders).to.equal(true);
        })

        it('should add a message to the queue indicating what tweets were collected', async () => {
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

            tweetStore.readRecentTweets.returns(timeSeriesData);

            await subject._handleTweetsFetched(economicEntityName, economicEntityType, tweets);

            const sendArg = producer.send.getCall(0).args[0];
            const sentEvent = JSON.parse(sendArg.messages[0].value);
            expect(sendArg.topic).to.equal('TWEETS_COLLECTED');
            expect(sentEvent.economicEntityName).to.equal(economicEntityName);
            expect(sentEvent.economicEntityType).to.equal(economicEntityType);

            const eventTweets = sentEvent.timeSeriesItems[0].tweets;
            expect(eventTweets[0].text).to.equal(tweets[0].text);
            expect(eventTweets[1].text).to.equal(tweets[1].text);

        })
    });

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

            expect(logger.warn).to.have.been.called;
        })
    })
});