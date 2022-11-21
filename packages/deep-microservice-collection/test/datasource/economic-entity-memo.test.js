import {EconomicEntityFactory, EconomicEntityType} from '@thinkdeep/model';
import chai from 'chai';
import chaiAsPromised from 'chai-as-promised';
import sinon from 'sinon';
import sinonChai from 'sinon-chai';

import {EconomicEntityMemo} from '../../src/datasource/economic-entity-memo.js';

chai.use(chaiAsPromised);
chai.use(sinonChai);
const expect = chai.expect;

describe('economic-entity-memo', () => {
  let mongoCollection;
  const entityName = 'firstbusiness';
  const entityType = EconomicEntityType.Business;
  const economicEntity = EconomicEntityFactory.economicEntity({
    name: entityName,
    type: entityType,
  });
  const databaseData = [
    {
      name: entityName,
      type: entityType,
    },
  ];
  let logger;
  let subject;
  beforeEach(() => {
    mongoCollection = {
      find: sinon.stub(),
      sort: sinon.stub(),
      limit: sinon.stub(),
      toArray: sinon.stub(),
      insertOne: sinon.stub(),
    };

    logger = {
      debug: sinon.spy(),
      info: sinon.spy(),
      warn: sinon.spy(),
      error: sinon.spy(),
    };

    mongoCollection.find.returns(mongoCollection);
    mongoCollection.sort.returns(mongoCollection);
    mongoCollection.limit.returns(mongoCollection);
    mongoCollection.toArray.returns(databaseData);

    subject = new EconomicEntityMemo(mongoCollection, logger);
  });

  afterEach(() => {
    sinon.restore();
  });

  describe('collectingData', () => {
    it('should return true if data is being collected for a given entity name and type', async () => {
      expect(await subject.collectingData(economicEntity)).to.equal(true);
    });

    it('should return false if data is not being collected for the specified entity name and type', async () => {
      mongoCollection.toArray.returns([]);
      expect(await subject.collectingData(economicEntity)).to.equal(false);
    });

    it('should throw an error if the economic entity is invalid', async () => {
      const invalidEconomicEntity = {name: '', type: ''};
      await expect(
        subject.collectingData(invalidEconomicEntity)
      ).to.be.rejectedWith(Error);
    });
  });

  describe('memoizeDataCollection', () => {
    it('should throw an error if an invalid economic entity is supplied', async () => {
      const invalidEconomicEntity = {name: '', type: ''};
      await expect(
        subject.memoizeDataCollection(invalidEconomicEntity)
      ).to.be.rejectedWith(Error);
    });

    it('should only memoize an economic entity if it has not been seen before', async () => {
      await subject.memoizeDataCollection(economicEntity);
      expect(mongoCollection.insertOne.callCount).to.equal(0);

      mongoCollection.toArray.returns([]);
      await subject.memoizeDataCollection(
        EconomicEntityFactory.economicEntity({
          name: 'somethingdifferent',
          type: EconomicEntityType.Business,
        })
      );
      expect(mongoCollection.insertOne.callCount).to.be.greaterThan(0);
    });
  });

  describe('readEconomicEntities', () => {
    it('should read all of the entries from the memo table', async () => {
      await subject.readEconomicEntities();
      const findArg = mongoCollection.find.getCall(0).args[0];
      expect(findArg).to.equal(undefined);
    });

    it('should return [] when an error is thrown by mongo', async () => {
      mongoCollection.find.throws();
      const result = await subject.readEconomicEntities();
      expect(result.length).to.equal(0);
    });
  });

  describe('_readMemo', () => {
    it('should throw an error if an invalid economic entity is supplied', async () => {
      const invalidEconomicEntity = {name: '', type: ''};
      await expect(subject._readMemo(invalidEconomicEntity)).to.be.rejectedWith(
        Error
      );
    });

    it('should read only those entries in the database that have both the same name and type', async () => {
      await subject._readMemo(economicEntity);
      const findArg = mongoCollection.find.getCall(0).args[0];
      expect(findArg.name).to.equal(entityName);
      expect(findArg.type).to.equal(entityType);
    });

    it('should throw an error when the database access fails', async () => {
      mongoCollection.find.throws();
      await expect(subject._readMemo(economicEntity)).to.be.rejectedWith(Error);
    });
  });
});
