import chai from 'chai';
import sinon from 'sinon';
import sinonChai from 'sinon-chai';

import { TweetStore } from '../../src/datasource/tweet-store.mjs';

chai.use(sinonChai);
const expect = chai.expect;

describe('tweet-store', () => {

    let mongoCollection;
    const economicEntityName = 'somebusiness';
    const economicEntityType = 'BUSINESS';
    const numTweetsToReturn = 12;
    const databaseData = [{
        timestamp: 1,
        tweets: [{
            text: 'This is a raw tweet'
        }]
    }];
    let subject;
    beforeEach(() => {
        mongoCollection = {
            find: sinon.stub(),
            sort: sinon.stub(),
            limit: sinon.stub(),
            toArray: sinon.stub(),
            insertOne: sinon.stub()
        };
        mongoCollection.find.returns(mongoCollection);
        mongoCollection.sort.returns(mongoCollection);
        mongoCollection.limit.returns(mongoCollection);
        mongoCollection.toArray.returns(databaseData);

        subject = new TweetStore(mongoCollection);
    });

    describe('readRecentTweets', () => {

        it('should return [] if economicTypeName is empty', async () => {
            const result = await subject.readRecentTweets('', economicEntityType, numTweetsToReturn);
            expect(result.length).to.equal(0);
        })

        it('should return [] if economicEntityName is not a string', async () => {
            const result = await subject.readRecentTweets(1, economicEntityType, numTweetsToReturn);
            expect(result.length).to.equal(0);
        })

        it('should return [] if economicEntityType is empty', async () => {
            const result = await subject.readRecentTweets(economicEntityName, '', numTweetsToReturn);
            expect(result.length).to.equal(0);
        })

        it('should return [] if economicEntityType is not a string', async () => {
            const result = await subject.readRecentTweets(economicEntityName, [], numTweetsToReturn);
            expect(result.length).to.equal(0);
        })

        it('should limit the number of returned results to numRecentTweets', async () => {
            await subject.readRecentTweets(economicEntityName, economicEntityType, numTweetsToReturn);
            const limit = mongoCollection.limit.getCall(0).args[0];
            expect(limit).to.equal(numTweetsToReturn);
        })

        it('should sort the tweets in descending order', async () => {
            await subject.readRecentTweets(economicEntityName, economicEntityType, numTweetsToReturn);
            const sortOptions = mongoCollection.sort.getCall(0).args[0];

            // NOTE: A value of -1 indicates a sort in descending order.
            expect(sortOptions.timestamp).to.equal(-1);
        })

        it('should read tweets from the database', async () => {
            await subject.readRecentTweets(economicEntityName, economicEntityType, numTweetsToReturn);
            expect(mongoCollection.find).to.have.been.called;
        })

        it('should package database tweets as an array', async () => {
            await subject.readRecentTweets(economicEntityName, economicEntityType, numTweetsToReturn);
            expect(mongoCollection.toArray).to.have.been.called;
        })

        it('should reduce the tweets', async () => {
            const tweets = [{
                timestamp: 1,
                tweets: [{
                    text: 'This is a raw tweet'
                }]
            },{
                timestamp: 2,
                tweets: [{
                    text: 'Something here'
                },{
                    text: 'second tweet'
                }]
            }];
            mongoCollection.find.returns(mongoCollection);
            mongoCollection.toArray.returns(tweets);

            const result = await subject.readRecentTweets(economicEntityName, economicEntityType, numTweetsToReturn);

            expect(result[0].timestamp).to.equal(1);
            expect(result[0].tweets.length).to.equal(1);
            expect(result[1].timestamp).to.equal(2);
            expect(result[1].tweets.length).to.equal(2);
        })

        it('should return [] if an error occurs', async () => {
            mongoCollection.find.throws();

            const result = await subject.readRecentTweets(economicEntityName, economicEntityType, numTweetsToReturn);

            expect(result.length).to.equal(0);
        })
    })

    describe('createTweets', () => {

        it('should insert the data into the database', async () => {
            const timestamp = 1;
            const tweets = [{
                text: 'i have something to say'
            },{
                text: 'something else'
            }];

            await subject.createTweets(timestamp, economicEntityName, economicEntityType, tweets);

            expect(mongoCollection.insertOne).to.have.been.called;
        })

        it('should return true if the insert succeeds', async() => {
            const timestamp = 1;
            const tweets = [{
                text: 'i have something to say'
            },{
                text: 'something else'
            }];

            const success = await subject.createTweets(timestamp, economicEntityName, economicEntityType, tweets);

            expect(success).to.equal(true);
        })

        it('should return false if the insert fails',async  () => {
            const timestamp = 1;
            const tweets = [{
                text: 'i have something to say'
            },{
                text: 'something else'
            }];

            mongoCollection.insertOne.throws();

            const success = await subject.createTweets(timestamp, economicEntityName, economicEntityType, tweets);

            expect(success).to.equal(false);
        })
    })

})