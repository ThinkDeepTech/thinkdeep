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

    let twitterAPI;
    let tweetStore;
    let economicEntityMemo;
    let commander;
    let admin;
    let producer;
    let logger;
    let subject;
    beforeEach(() => {


        // TODO: Add additional tests.
        twitterAPI = {
            tweets: sinon.stub()
        };

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

        subject = new CollectionService(twitterAPI, tweetStore, economicEntityMemo, commander, admin, producer, logger);
    });

    describe('constructor', () => {

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
            expect(firstCommands._callback).to.equal(secondCommands._callback);
        })

        it('should throw an error if the entity type is unknown', () => {
            const entityName = 'somebusiness';
            const entityType = 'unknownentity';
            expect(subject._commands.bind(subject, entityName, entityType)).to.throw(Error);
        })

        it('should include a command to collect tweets for type business', () => {
            const entityName = 'somebusiness';
            const entityType = 'BUSINESS';

            const commands = subject._commands(entityName, entityType);

            const actualCommand = commands[0]._callback;
            expect(actualCommand.name).to.include('_collectTweets');
        })
    });

    describe('_collectTweets', () => {

        it('should fetch tweets associated with the specified business', async () => {
            const entityName = 'somebusiness';
            const entityType = 'BUSINESS';
            await subject._collectTweets(entityName, entityType);
            expect(twitterAPI.tweets.withArgs(entityName)).to.have.been.called;
        })

        it('should store the tweets', async () => {
            tweetStore.createTweets.returns(true);

            await subject._collectTweets('someonebusiness', 'BUSINESS');

            expect(tweetStore.createTweets).to.have.been.called;
        })
    });
});