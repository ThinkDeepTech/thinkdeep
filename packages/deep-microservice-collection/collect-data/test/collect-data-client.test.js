import chai from 'chai';
import sinon from 'sinon';
import sinonChai from 'sinon-chai';

import { CollectDataClient } from '../src/collect-data-client.js';

const expect = chai.expect;
chai.use(sinonChai);

describe('collect-data-client', () => {

    let twitterClient;
    let kafkaClient;
    let admin;
    let producer;
    let logger;
    let subject;
    beforeEach(() => {

        twitterClient = {
            v2: {
                get: sinon.stub()
            }
        };

        admin = {
            connect: sinon.stub(),
            createTopics: sinon.stub(),
            disconnect: sinon.stub()
        };

        admin.disconnect.returns( Promise.resolve() );

        producer = {
            connect: sinon.stub(),
            send: sinon.stub(),
            disconnect: sinon.stub()
        };

        producer.disconnect.returns( Promise.resolve() );

        kafkaClient = {
            admin: sinon.stub().returns(admin),
            producer: sinon.stub().returns(producer)
        };

        logger = {
            debug: sinon.stub(),
            info: sinon.stub(),
            warn: sinon.stub()
        }

        subject = new CollectDataClient(twitterClient, kafkaClient, logger);
    });

    describe('connect', () => {

        it('should connect to the kafka admin', async () => {
            await subject.connect();

            expect(admin.connect).to.have.been.called;
        })

        it('should connect to the kafka producer', async () => {
            await subject.connect();

            expect(producer.connect).to.have.been.called;
        })
    })

    describe('fetchRecentTweets', () => {

        it('should query the twitter api for recent tweets', async () => {
            const getResponse = {
                data: [{
                    text: 'some text here'
                }, {
                    text: 'some more text'
                }]
            }
            twitterClient.v2.get.returns(getResponse);

            await subject.fetchRecentTweets({
                query: 'Google en:us'
            });

            const getArgs = twitterClient.v2.get.getCall(0).args;
            expect(getArgs[0]).to.equal('tweets/search/recent');
        })

        it('should apply the desired query parameters', async () => {
            const getResponse = {
                data: [{
                    text: 'some text here'
                }, {
                    text: 'some more text'
                }]
            }
            twitterClient.v2.get.returns(getResponse);
            const queryParams = {
                query: 'Google en:us'
            };

            await subject.fetchRecentTweets(queryParams);

            const getArgs = twitterClient.v2.get.getCall(0).args;
            expect(getArgs[1]).to.equal(queryParams);
        })
    })

    describe('emitEvent', () => {

        it('should create the event as a kafka topic', async () => {
            const eventName = 'TEST_EVENT';
            const data = {
                eventInfo: 'information'
            };

            await subject.emitEvent(eventName, data);

            const createTopicsArgs = admin.createTopics.getCall(0).args;

            expect(admin.createTopics).to.have.been.calledOnce;
            expect(createTopicsArgs[0].topics[0].topic).to.equal(eventName);
        })

        it('should trigger the event', async () => {
            const eventName = 'TEST_EVENT';
            const data = {
                eventInfo: 'information'
            };

            await subject.emitEvent(eventName, data);

            const eventArgs = producer.send.getCall(0).args;
            expect(producer.send).to.have.been.calledOnce;
            expect(eventArgs[0].topic).to.equal(eventName);
            expect(eventArgs[0].messages[0].value).to.equal(JSON.stringify(data));
        })
    })
});