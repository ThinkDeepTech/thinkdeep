import chai from 'chai';
import sinon from 'sinon';
import sinonChai from 'sinon-chai';

import { SentimentStore } from '../../src/datasource/sentiment-store.js';

chai.use(sinonChai);
const expect = chai.expect;

describe('sentiment-store', () => {

    let databaseData;
    let mongoCollection;
    let logger;
    let subject;
    beforeEach(() => {
        mongoCollection = {
            find: sinon.stub(),
            sort: sinon.stub(),
            limit: sinon.stub(),
            toArray: sinon.stub(),
            insertOne: sinon.stub()
        };

        logger = {
            debug: sinon.spy(),
            info: sinon.spy(),
            warn: sinon.spy(),
            error: sinon.spy()
        };

        databaseData = [{
            timestamp: 1,
            sentiments: [{
                score: 1.2,
                tweets: [{
                    text: "Hello"
                }]
            }]
        }];

        mongoCollection.find.returns(mongoCollection);
        mongoCollection.sort.returns(mongoCollection);
        mongoCollection.limit.returns(mongoCollection);
        mongoCollection.toArray.returns(databaseData);

        subject = new SentimentStore(mongoCollection, logger);
    });

    describe('readMostRecentSentiments', () => {
        it('should return immediately if economic entity name is not a string', async () => {
            const economicEntityName = {};
            const economicEntityType = 'BUSINESS';

            await subject.readMostRecentSentiments(economicEntityName, economicEntityType);

            expect(mongoCollection.find).not.to.have.been.called;
        })

        it('should return immediately if economic entity name is empty', async () => {
            const economicEntityName = '';
            const economicEntityType = 'BUSINESS';

            await subject.readMostRecentSentiments(economicEntityName, economicEntityType);

            expect(mongoCollection.find).not.to.have.been.called;
        })

        it('should return immediately if economic entity type is not a string', async() => {
            const economicEntityName = 'Google';
            const economicEntityType = {};

            await subject.readMostRecentSentiments(economicEntityName, economicEntityType);

            expect(mongoCollection.find).not.to.have.been.called;
        })

        it('should return immediately if economic entity type is empty', async() => {
            const economicEntityName = 'Google';
            const economicEntityType = '';

            await subject.readMostRecentSentiments(economicEntityName, economicEntityType);

            expect(mongoCollection.find).not.to.have.been.called;
        })

        it('should return the most recent sentiments', async () => {
            const economicEntityName = 'Google';
            const economicEntityType = 'BUSINESS';

            await subject.readMostRecentSentiments(economicEntityName, economicEntityType);

            const limitArg = mongoCollection.limit.getCall(0).args[0];
            const sortArg = mongoCollection.sort.getCall(0).args[0];

            // Sort in descending order by timestamp
            expect(sortArg.timestamp).to.equal(-1);

            // Limit to one result
            expect(limitArg).to.equal(1);
        })

        it('should return sentiments associated with economic entity name and type', async () => {
            const economicEntityName = 'Google';
            const economicEntityType = 'BUSINESS';

            await subject.readMostRecentSentiments(economicEntityName, economicEntityType);

            const findArg = mongoCollection.find.getCall(0).args[0];
            expect(findArg.economicEntityName).to.equal(economicEntityName.toLowerCase());
            expect(findArg.economicEntityType).to.equal(economicEntityType.toLowerCase());
        })

        it('should return an empty array on read failure', async () => {
            const economicEntityName = 'Google';
            const economicEntityType = 'BUSINESS';

            mongoCollection.find.throws();

            const result = await subject.readMostRecentSentiments(economicEntityName, economicEntityType);

            expect(Array.isArray(result)).to.equal(true);
            expect(result.length).to.equal(0);
        })
    })

    describe('createSentiments', () => {

        it('should return immediately if economic entity name is not a string', async () => {
            const timestamp = 1;
            const economicEntityName = {};
            const economicEntityType = 'BUSINESS';
            const sentiments = [{
                score: 1.2,
                tweets: [{
                    text: 'magical!'
                }]
            }];

            await subject.createSentiments(timestamp, economicEntityName, economicEntityType, sentiments);

            expect(mongoCollection.insertOne).not.to.have.been.called;
        })

        it('should return immediately if economic entity name is empty', async () => {
            const timestamp = 1;
            const economicEntityName = '';
            const economicEntityType = 'BUSINESS';
            const sentiments = [{
                score: 1.2,
                tweets: [{
                    text: 'magical!'
                }]
            }];

            await subject.createSentiments(timestamp, economicEntityName, economicEntityType, sentiments);

            expect(mongoCollection.insertOne).not.to.have.been.called;
        })

        it('should return immediately if economic entity type is not a string', async() => {
            const timestamp = 1;
            const economicEntityName = 'Google';
            const economicEntityType = 9;
            const sentiments = [{
                score: 1.2,
                tweets: [{
                    text: 'magical!'
                }]
            }];

            await subject.createSentiments(timestamp, economicEntityName, economicEntityType, sentiments);

            expect(mongoCollection.insertOne).not.to.have.been.called;
        })

        it('should return immediately if economic entity type is empty', async() => {
            const timestamp = 1;
            const economicEntityName = 'Google';
            const economicEntityType = '';
            const sentiments = [{
                score: 1.2,
                tweets: [{
                    text: 'magical!'
                }]
            }];

            await subject.createSentiments(timestamp, economicEntityName, economicEntityType, sentiments);

            expect(mongoCollection.insertOne).not.to.have.been.called;
        })

        it('should return immediately if timestamp is zero', async () => {
            const timestamp = 0;
            const economicEntityName = 'Google';
            const economicEntityType = 'BUSINESS';
            const sentiments = [{
                score: 1.2,
                tweets: [{
                    text: 'magical!'
                }]
            }];

            await subject.createSentiments(timestamp, economicEntityName, economicEntityType, sentiments);

            expect(mongoCollection.insertOne).not.to.have.been.called;
        })

        it('should insert the sentiments', async () => {
            const timestamp = 1;
            const economicEntityName = 'Google';
            const economicEntityType = 'BUSINESS';
            const sentiments = [{
                score: 1.2,
                tweets: [{
                    text: 'magical!'
                }]
            }];

            const success = await subject.createSentiments(timestamp, economicEntityName, economicEntityType, sentiments);

            expect(mongoCollection.insertOne).to.have.been.called;
            expect(success).to.equal(true);
        })

        it('should indicate failure if an error is thrown during insertion', async () => {
            const timestamp = 1;
            const economicEntityName = 'Google';
            const economicEntityType = 'BUSINESS';
            const sentiments = [{
                score: 1.2,
                tweets: [{
                    text: 'magical!'
                }]
            }];

            mongoCollection.insertOne.throws();

            const success = await subject.createSentiments(timestamp, economicEntityName, economicEntityType, sentiments);

            expect(mongoCollection.insertOne).to.have.been.called;
            expect(success).to.equal(false);
        })

    })

});