import chai from 'chai';
import mockDb from 'mock-knex';
import sinon from 'sinon';
import sinonChai from 'sinon-chai';
const expect = chai.expect;
chai.use(sinonChai);

import { CollectionService } from '../src/collection-service.mjs';
import { TwitterDataSource } from '../src/datasource/twitter-datasource.mjs';

describe('analysis-service', () => {

    let dataSource;
    let subject;
    beforeEach(() => {
        TwitterDataSource.prototype.getTweets = sinon.stub();
        dataSource = new TwitterDataSource();
        subject = new CollectionService(dataSource);
    });

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

        it('should execute the body if the user has read:all scope', () => {
            const user = { scope: 'email profile read:all' };
            const result = subject.collectEconomicData('someone', 'business', user);
            expect(dataSource.getTweets).to.have.been.called;
        })

        it('should fetch the appropriate strategy for the entityType', async () => {
            const user = { scope: 'read:all' };
            const result = await subject.collectEconomicData('someone', 'business', user);
            expect(dataSource.getTweets).to.have.been.called;
            expect(result.success).to.equal(true);
        })
    })

    describe('_getStrategy', () => {

        it('should fetch the business strategy for entityType business', async () => {
            const entityType = 'BUSINESS';
            const expectedStrategy = async () => { return true; };
            const actualStrategy = subject._getStrategy(entityType, expectedStrategy);
            expect(expectedStrategy).to.equal(actualStrategy);
        })

        it('should perform case-insentitive comparisons', () => {
            const entityType1 = 'BUSINESS';
            const entityType2 = 'bUsInEss';
            const expectedStrategy = async () => { return true; };
            const firstStrategy = subject._getStrategy(entityType1, expectedStrategy);
            const secondStrategy = subject._getStrategy(entityType2, expectedStrategy);
            expect(firstStrategy).to.equal(secondStrategy);
        })

        it('should throw an error if the entity type is unknown', () => {
            const entityType = 'unknownentity';
            expect(subject._getStrategy.bind(subject, entityType)).to.throw(Error);
        })

    });

    describe('_collectBusinessData', () => {

        it('should fetch tweets associated with the specified business', async () => {
            const businessName = 'somebusiness';
            await subject._collectBusinessData(businessName, dataSource);
            expect(dataSource.getTweets.withArgs(businessName)).to.have.been.called;
        })

        it('should store the tweets', async () => {
            assert.fail();
        })

        it('should return true if the operation succeeds', async () => {
            assert.fail();
        })

    });
});