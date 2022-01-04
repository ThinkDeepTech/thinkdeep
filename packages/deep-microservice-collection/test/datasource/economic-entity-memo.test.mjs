import chai from 'chai';
import sinon from 'sinon';
import sinonChai from 'sinon-chai';

import { EconomicEntityMemo } from '../../src/datasource/economic-entity-memo.mjs';

chai.use(sinonChai);
const expect = chai.expect;

describe('economic-entity-memo', () => {

    let mongoCollection;
    const entityName = 'firstbusiness';
    const entityType = 'BUSINESS';
    const databaseData = [{
        name: entityName,
        type: entityType
    }];
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

        mongoCollection.find.returns(mongoCollection);
        mongoCollection.sort.returns(mongoCollection);
        mongoCollection.limit.returns(mongoCollection);
        mongoCollection.toArray.returns(databaseData);

        subject = new EconomicEntityMemo(mongoCollection, logger);
    });

    describe('collectingData', () => {

        it('should return true if data is being collected for a given entity name and type', async () => {
            expect( await subject.collectingData(entityName, entityType) ).to.equal(true);
        })

        it('should return false if data is not being collected for the specified entity name and type', async () => {
            mongoCollection.toArray.returns([]);
            expect( await subject.collectingData('firstbusiness', 'BUSINESS') ).to.equal(false);
        })

        it('should throw an error if the entity name is empty', (done) => {
            subject.collectingData('', entityType).then(() => {
                done('An error was not thrown when it should have been.');
            }, (reason) => {
                done();
            })
        })

        it('should throw an error if the entity name is not a string', (done) => {
            subject.collectingData([], entityType).then(() => {
                done('An error was not thrown when it should have been.');
            }, (reason) => {
                done();
            })
        })

        it('should throw an error if the entity type is empty', (done) => {
            subject.collectingData(entityName, '').then(() => {
                done('An error was not thrown when it should have been.');
            }, (reason) => {
                done();
            })
        })

        it('should throw an error if the entity type is not a string', (done) => {
            subject.collectingData(entityName, 12.5).then(() => {
                done('An error was not thrown when it should have been.');
            }, (reason) => {
                done();
            })
        })
    })

    describe('memoizeDataCollection', () => {

        it('should throw an error if the entity name is empty', (done) => {
            subject.memoizeDataCollection('', entityType).then(() => {
                done('An error was not thrown when it should have been.');
            }, (reason) => {
                done();
            })
        })

        it('should throw an error if the entity name is not a string', (done) => {
            subject.memoizeDataCollection({}, entityType).then(() => {
                done('An error was not thrown when it should have been.');
            }, (reason) => {
                done();
            })
        })

        it('should throw an error if the entity type is empty', (done) => {
            subject.memoizeDataCollection(entityName, '').then(() => {
                done('An error was not thrown when it should have been.');
            }, (reason) => {
                done();
            })
        })

        it('should throw an error if the entity name is not a string', (done) => {
            subject.memoizeDataCollection(entityName, 1).then(() => {
                done('An error was not thrown when it should have been.');
            }, (reason) => {
                done();
            })
        })

        it('should only memoize an entity name and type if it has not been seen before', async () => {

            await subject.memoizeDataCollection(entityName, entityType);
            expect(mongoCollection.insertOne).not.to.have.been.called;

            mongoCollection.toArray.returns([]);
            await subject.memoizeDataCollection('somethingdifferent', entityType);
            expect(mongoCollection.insertOne).to.have.been.called;
        });
    })

    describe('readEconomicEntities', () => {

        it('should read all of the entries from the memo table', async () => {

        })
    })

});