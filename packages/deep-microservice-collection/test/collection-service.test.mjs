import chai from 'chai';
import sinon from 'sinon';
import sinonChai from 'sinon-chai';
const expect = chai.expect;
chai.use(sinonChai);

import { CollectionService } from '../src/collection-service.mjs';
import { TwitterAPI } from '../src/datasource/twitter-api.mjs';
import { TweetStore } from '../src/datasource/tweet-store.mjs';

describe('collection-service', () => {

    let twitterAPI;
    let tweetStore;
    let logger;
    let subject;
    beforeEach(() => {
        twitterAPI = new TwitterAPI();
        TwitterAPI.prototype.tweets = sinon.stub();

        tweetStore = new TweetStore({});
        TweetStore.prototype.createTweets = sinon.stub();
        TweetStore.prototype.readRecentTweets = sinon.stub();

        logger = {
            debug: sinon.stub(),
            info: sinon.stub(),
            warn: sinon.stub(),
            error: sinon.stub()
        };

        subject = new CollectionService(twitterAPI, tweetStore, logger);
    });

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
            await subject.collectEconomicData('someone', 'business', user);
            expect(twitterAPI.tweets).to.have.been.called;
        })

        it('should fetch the appropriate strategy for the entityType', async () => {
            const user = { scope: 'read:all' };
            tweetStore.createTweets.returns(true);

            const result = await subject.collectEconomicData('someone', 'business', user);

            expect(twitterAPI.tweets).to.have.been.called;
            expect(result.success).to.equal(true);
        })
    })

    describe('_strategy', () => {

        it('should fetch the business strategy for entityType business', async () => {
            const entityType = 'BUSINESS';
            const expectedStrategy = async () => { return true; };
            const actualStrategy = subject._strategy(entityType, expectedStrategy);
            expect(expectedStrategy).to.equal(actualStrategy);
        })

        it('should perform case-insentitive comparisons', () => {
            const entityType1 = 'BUSINESS';
            const entityType2 = 'bUsInEss';
            const expectedStrategy = async () => { return true; };
            const firstStrategy = subject._strategy(entityType1, expectedStrategy);
            const secondStrategy = subject._strategy(entityType2, expectedStrategy);
            expect(firstStrategy).to.equal(secondStrategy);
        })

        it('should throw an error if the entity type is unknown', () => {
            const entityType = 'unknownentity';
            expect(subject._strategy.bind(subject, entityType)).to.throw(Error);
        })

    });

    describe('_collectBusinessData', () => {

        it('should fetch tweets associated with the specified business', async () => {
            const businessName = 'somebusiness';
            await subject._collectBusinessData(businessName, twitterAPI);
            expect(twitterAPI.tweets.withArgs(businessName)).to.have.been.called;
        })

        it('should store the tweets', async () => {
            tweetStore.createTweets.returns(true);

            await subject._collectBusinessData('someonebusiness');

            expect(tweetStore.createTweets).to.have.been.called;
        })
    });
});