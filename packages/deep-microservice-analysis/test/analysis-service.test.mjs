import chai, { assert } from 'chai';
import mockDb from 'mock-knex';
import sinon from 'sinon';
import sinonChai from 'sinon-chai';
const expect = chai.expect;
chai.use(sinonChai);

import { AnalysisService } from '../src/analysis-service.mjs';
import { PostgresDataSource } from '../src/datasource/postgres-datasource.mjs';

describe('analysis-service', () => {

    let dataSource;
    let sentimentLib;
    let logger;
    let collectionBinding;
    let subject;
    beforeEach((done) => {
        PostgresDataSource.prototype.getBusinessGraph = sinon.spy();
        dataSource = new PostgresDataSource({ client: 'pg' });
        mockDb.mock(dataSource.knex);
        sentimentLib = {
            analyze: sinon.stub()
        };
        collectionBinding = {
            query: {
                tweets: sinon.stub()
            }
        };
        logger = {
            debug: sinon.stub(),
            info: sinon.stub(),
            warn: sinon.stub(),
            error: sinon.stub()
        }
        subject = new AnalysisService(dataSource, sentimentLib, collectionBinding, logger);
        done();
    });

    afterEach((done) => {
        mockDb.unmock(dataSource.knex);
        done();
    });

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
                timestamp: 1,
                tweets: [{
                    text: 'something'
                }, {
                    text: 'something else'
                }]
            }];
            collectionBinding.query.tweets.returns(tweets);

            const sentimentResult = {
                score: 1
            };
            sentimentLib.analyze.returns(sentimentResult);

            const response = await subject.sentiments(economicEntityName, economicEntityType, user);

            expect(Object.keys(response).length).not.to.equal(0);
        })

        it('should fetch data from the collection service', async () => {
            const economicEntityName = "SomeBusinessName";
            const economicEntityType = "BUSINESS";
            const user = { scope: "profile email read:all" };
            const tweets = [{
                timestamp: 1,
                tweets: [{
                    text: 'something'
                }, {
                    text: 'something else'
                }]
            }];
            collectionBinding.query.tweets.returns(tweets);

            const sentimentResult = {
                score: 1
            };
            sentimentLib.analyze.returns(sentimentResult);

            const response = await subject.sentiments(economicEntityName, economicEntityType, user);

            expect(collectionBinding.query.tweets).to.have.been.called;
        })

        it('should compute the sentiment for each tweet entry returned from the collection microservice', async () => {
            const economicEntityName = "SomeBusinessName";
            const economicEntityType = "BUSINESS";
            const user = { scope: "profile email read:all" };
            const tweets = [{
                timestamp: 1,
                tweets: [{
                    text: 'something'
                }, {
                    text: 'something else'
                }]
            }];
            collectionBinding.query.tweets.returns(tweets);

            const sentimentResult = {
                score: 1
            };
            sentimentLib.analyze.returns(sentimentResult);

            const response = await subject.sentiments(economicEntityName, economicEntityType, user);

            expect(sentimentLib.analyze).to.have.been.called;
        })

        it('should skip over entries that include a null value for tweets ', async () => {
            const economicEntityName = "SomeBusinessName";
            const economicEntityType = "BUSINESS";
            const user = { scope: "profile email read:all" };
            const tweets = [{
                timestamp: 1,
                tweets: null
            }];
            collectionBinding.query.tweets.returns(tweets);

            const response = await subject.sentiments(economicEntityName, economicEntityType, user);

            expect(sentimentLib.analyze).not.to.have.been.called;
        })

        it('should skip over entries that include an empty tweets array ', async () => {
            const economicEntityName = "SomeBusinessName";
            const economicEntityType = "BUSINESS";
            const user = { scope: "profile email read:all" };
            const tweets = [{
                timestamp: 1,
                tweets: []
            }];
            collectionBinding.query.tweets.returns(tweets);

            const response = await subject.sentiments(economicEntityName, economicEntityType, user);

            expect(sentimentLib.analyze).not.to.have.been.called;
        })

    });

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

            const result = subject._averageSentiment(data);

            const firstPassArgument = sentimentLib.analyze.getCall(0).args[0];
            const secondPassArgument = sentimentLib.analyze.getCall(1).args[0];

            expect(firstPassArgument).to.equal(data.tweets[0].text.toLowerCase());
            expect(secondPassArgument).to.equal(data.tweets[1].text.toLowerCase());
        })
    })
})