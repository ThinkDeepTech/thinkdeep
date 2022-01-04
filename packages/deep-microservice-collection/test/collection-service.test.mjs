import chai from 'chai';
import sinon from 'sinon';
import sinonChai from 'sinon-chai';
const expect = chai.expect;
chai.use(sinonChai);

import { Commander } from '../src/commander.mjs';
import { CollectionService } from '../src/collection-service.mjs';
import { EconomicEntityMemo } from '../src/datasource/economic-entity-memo.mjs';
import { TwitterAPI } from '../src/datasource/twitter-api.mjs';
import { TweetStore } from '../src/datasource/tweet-store.mjs';

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
    let logger;
    let subject;
    beforeEach(() => {

        TwitterAPI.prototype.tweets = sinon.stub();
        twitterAPI = new TwitterAPI();

        TweetStore.prototype.createTweets = sinon.stub();
        TweetStore.prototype.readRecentTweets = sinon.stub();
        tweetStore = new TweetStore({});

        logger = {
            debug: sinon.stub(),
            info: sinon.stub(),
            warn: sinon.stub(),
            error: sinon.stub()
        };

        EconomicEntityMemo.prototype.collectingData = sinon.stub();
        EconomicEntityMemo.prototype.memoizeDataCollection = sinon.stub();
        EconomicEntityMemo.prototype.readEconomicEntities = sinon.stub();
        EconomicEntityMemo.prototype._readMemo = sinon.stub();
        economicEntityMemo = new EconomicEntityMemo({}, logger);

        EconomicEntityMemo.prototype.readEconomicEntities.returns( Promise.resolve( memoizedEconomicEntities ))
        EconomicEntityMemo.prototype.collectingData.returns( true );

        Commander.prototype.execute = sinon.stub();
        Commander.prototype.stopAllCommands = sinon.stub();
        commander = new Commander(logger);

        subject = new CollectionService(twitterAPI, tweetStore, economicEntityMemo, commander, logger);
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
            const user = { scope: 'read:all'};
            const result = await subject.tweets(entityName, 'business', user);
            expect(result.length).to.equal(0);
        })

        it('should return [] if the economicEntityName is not a string', async () => {
            const entityName = 1;
            const user = { scope: 'read:all'};
            const result = await subject.tweets(entityName, 'business', user);
            expect(result.length).to.equal(0);
        })

        it('should return [] if the economicEntityType is empty', async () => {
            const entityType = '';
            const user = { scope: 'read:all'};
            const result = await subject.tweets('somename', entityType, user);
            expect(result.length).to.equal(0);
        })

        it('should return [] if the economicEntityType is not a string', async () => {
            const entityType = {};
            const user = { scope: 'read:all'};
            const result = await subject.tweets('somename', entityType, user);
            expect(result.length).to.equal(0);
        })

        it('should return [] if the provided user does not have the read:all scope', async () => {
            const user = { scope: 'profile email'};
            const result = await subject.tweets('somename', 'business', user);
            expect(result.length).to.equal(0);
        })

        it('should read the tweets if the user has read:all scope', async () => {
            const user = { scope: 'read:all'};
            const result = await subject.tweets('somename', 'business', user);
            expect(tweetStore.readRecentTweets).to.have.been.called;
        })

        it('should read tweets from the store', async () => {
            const user = { scope: 'read:all'};
            const result = await subject.tweets('somename', 'business', user);
            expect(tweetStore.readRecentTweets).to.have.been.called;
        })
    })

    describe('collectEconomicData', () => {
        it('should indicate failure if the entityName is not specified', async () => {
            const entityName = "";
            const user = { scope: 'read:all'};
            const result = await subject.collectEconomicData(entityName, 'business', user);
            expect(result.success).to.equal(false);
        })

        it('should indicate failure if the entityName is not a string', async () => {
            const entityName = {};
            const user = { scope: 'read:all'};
            const result = await subject.collectEconomicData(entityName, 'business', user);
            expect(result.success).to.equal(false);
        })

        it('should indicate failure if the entityType is not specified', async () => {
            const entityType = '';
            const user = { scope: 'read:all'};
            const result = await subject.collectEconomicData('somename', entityType, user);
            expect(result.success).to.equal(false);
        })

        it('should indicate failure if the entityType is not a string', async () => {
            const entityType = [];
            const user = { scope: 'read:all'};
            const result = await subject.collectEconomicData('somename', entityType, user);
            expect(result.success).to.equal(false);
        })

        it('should indicate failure if the read:all scope is absent from the user', async () => {
            const user = { scope: 'email profile'};
            const result = await subject.collectEconomicData('somename', 'business', user);
            expect(result.success).to.equal(false);
        })

        it('should indicate failure if a user object is not supplied', async () => {
            const result = await subject.collectEconomicData('somename', 'business');
            expect(result.success).to.equal(false);
        })

        it('should execute the body if the user has read:all scope', async () => {
            const user = { scope: 'email profile read:all' };
            const result = await subject.collectEconomicData('somebusiness', 'business', user);
            expect(result.success).to.equal(true);
        })

        it('should not collect data if data is already being collected', async () => {
            const user = { scope: 'email profile read:all' };
            await subject.collectEconomicData('somebusiness', 'business', user);
            expect(economicEntityMemo.memoizeDataCollection).not.to.have.been.called;
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