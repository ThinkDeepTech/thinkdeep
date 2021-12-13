import chai from 'chai';
import sinon from 'sinon';
import sinonChai from 'sinon-chai';

import { TweetStore } from '../../src/datasource/tweet-store.mjs';

chai.use(sinonChai);
const expect = chai.expect;

describe('tweet-store', () => {

    let mongoCollection;
    let subject;
    beforeEach(() => {
        mongoCollection = {
            find: sinon.stub(),
            toArray: sinon.stub(),
            insertOne: sinon.stub()
        };
        subject = new TweetStore(mongoCollection);
    });

    describe('readTweets', () => {

        it('should read tweets from the database', async () => {
            const economicEntityName = "some business name";
            const economicEntityType = 'BUSINESS';
            const databaseData = [{
                timestamp: 1,
                tweets: [{
                    text: 'This is a raw tweet'
                }]
            }];
            mongoCollection.find.returns(mongoCollection);
            mongoCollection.toArray.returns(databaseData);

            await subject.readTweets(economicEntityName, economicEntityType);

            expect(mongoCollection.find).to.have.been.called;
        })

        it('should package database tweets as an array', async () => {
            const economicEntityName = "some business name";
            const economicEntityType = 'BUSINESS';
            const databaseData = [{
                timestamp: 1,
                tweets: [{
                    text: 'This is a raw tweet'
                }]
            }];
            mongoCollection.find.returns(mongoCollection);
            mongoCollection.toArray.returns(databaseData);

            await subject.readTweets(economicEntityName, economicEntityType);

            expect(mongoCollection.toArray).to.have.been.called;
        })

        it('should reduce the tweets', async () => {
            const economicEntityName = "some business name";
            const economicEntityType = 'BUSINESS';
            const databaseData = [{
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
            mongoCollection.toArray.returns(databaseData);

            const result = await subject.readTweets(economicEntityName, economicEntityType);

            expect(result[0].timestamp).to.equal(1);
            expect(result[0].tweets.length).to.equal(1);
            expect(result[1].timestamp).to.equal(2);
            expect(result[1].tweets.length).to.equal(2);
        })

        it('should return [] if an error occurs', async () => {
            const economicEntityName = "some business name";
            const economicEntityType = 'BUSINESS';
            const databaseData = [{
                timestamp: 1,
                tweets: [{
                    text: 'This is a raw tweet'
                }]
            }];
            mongoCollection.find.throws();

            const result = await subject.readTweets(economicEntityName, economicEntityType);

            expect(result.length).to.equal(0);
        })
    })

    describe('createTweets', () => {

        it('should insert the data into the database', async () => {
            const timestamp = 1;
            const economicEntityName = 'some name';
            const economicEntityType = 'BUSINESS';
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
            const economicEntityName = 'some name';
            const economicEntityType = 'BUSINESS';
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
            const economicEntityName = 'some name';
            const economicEntityType = 'BUSINESS';
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