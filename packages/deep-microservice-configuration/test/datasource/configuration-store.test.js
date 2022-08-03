import chai from 'chai';
import sinon from 'sinon';
import sinonChai from 'sinon-chai';

import {ConfigurationStore} from '../../src/datasource/configuration-store.js';

chai.use(sinonChai);
const expect = chai.expect;

describe('configuration-store', () => {
  let subject;
  let collection;
  const intermediate = {
    limit: sinon.stub().returns({toArray: sinon.stub()}),
  };
  const configuration = {
    observedEconomicEntities: [
      {
        name: 'SomeBusiness',
        type: 'BUSINESS',
      },
    ],
  };
  beforeEach(() => {
    collection = {
      find: sinon.stub(),
      insertOne: sinon.stub(),
      updateOne: sinon.stub(),
    };
    collection.find.returns(intermediate);
    intermediate.limit().toArray.returns([configuration]);

    subject = new ConfigurationStore(collection);
  });

  afterEach(() => {
    sinon.restore();
  });

  describe('configurationExists', () => {
    it('should throw an error if the user email is empty', async () => {
      const userEmail = '';

      await expect(subject.configurationExists(userEmail)).to.be.rejectedWith(
        Error
      );
    });

    it('should throw an error if the user email is not a string', async () => {
      const userEmail = [];

      await expect(subject.configurationExists(userEmail)).to.be.rejectedWith(
        Error
      );
    });

    it('should read the configuration for the specified user', async () => {
      const userEmail = 'someemail@email.com';
      await subject.configurationExists(userEmail);
      expect(collection.find.callCount).to.equal(1);
    });

    it('should check that the configuration is an object', async () => {
      const userEmail = 'someemail@email.com';
      intermediate.limit().toArray.returns([{}]);

      const exists = await subject.configurationExists(userEmail);
      expect(exists).to.equal(false);
    });

    it('should check that the configuration includes observed economic entities', async () => {
      const userEmail = 'someemail@email.com';
      intermediate.limit().toArray.returns([{irrelevant: []}]);

      const exists = await subject.configurationExists(userEmail);
      expect(exists).to.equal(false);
    });
  });

  describe('createConfigurationForUser', () => {
    it('should throw an error if the user email is empty', async () => {
      const userEmail = '';

      await expect(
        subject.createConfigurationForUser(userEmail, configuration)
      ).to.be.rejectedWith(Error);
    });

    it('should throw an error if the user email is not a string', async () => {
      const userEmail = [];
      await expect(
        subject.createConfigurationForUser(userEmail, configuration)
      ).to.be.rejectedWith(Error);
    });

    it('should throw an error if an invalid configuration is supplied', async () => {
      const userEmail = 'somevalid@email.com';
      await expect(
        subject.createConfigurationForUser(userEmail, configuration)
      ).to.be.rejectedWith(Error);
    });

    it('should throw an error if insertion fails', async () => {
      const userEmail = 'somevalid@email.com';
      collection.insertOne.throws();

      await expect(
        subject.createConfigurationForUser(userEmail, configuration)
      ).to.be.rejectedWith(Error);
    });

    it('should correctly insert the configuration', async () => {
      const userEmail = 'somevalid@email.com';
      await subject.createConfigurationForUser(userEmail, configuration);
      expect(collection.insertOne.callCount).to.equal(1);
    });
  });

  describe('readConfigurationForUser', () => {
    it('should throw an error if the user email is empty', async () => {
      const userEmail = '';

      await expect(
        subject.readConfigurationForUser(userEmail)
      ).to.be.rejectedWith(Error);
    });

    it('should throw an error if the user email is not a string', async () => {
      const userEmail = [];
      await expect(
        subject.readConfigurationForUser(userEmail)
      ).to.be.rejectedWith(Error);
    });

    it('should throw an error if a failure occurs during the read', async () => {
      const userEmail = 'somevalid@email.com';
      collection.find.throws();

      await expect(
        subject.readConfigurationForUser(userEmail)
      ).to.be.rejectedWith(Error);
    });

    it('should return the desired configuration', async () => {
      const userEmail = 'somevalid@email.com';
      const config = await subject.readConfigurationForUser(userEmail);
      expect(collection.find.callCount).to.equal(1);
      expect(config).to.equal(configuration);
    });
  });

  describe('updateConfigurationForUser', () => {
    it('should throw an error if the user email is empty', async () => {
      const userEmail = '';

      await expect(
        subject.updateConfigurationForUser(userEmail, configuration)
      ).to.be.rejectedWith(Error);
    });

    it('should throw an error if the user email is not a string', async () => {
      const userEmail = [];
      await expect(
        subject.updateConfigurationForUser(userEmail, configuration)
      ).to.be.rejectedWith(Error);
    });

    it('should throw an error if an invalid configuration is supplied', async () => {
      const userEmail = 'somevalid@email.com';
      await expect(
        subject.updateConfigurationForUser(userEmail, configuration)
      ).to.be.rejectedWith(Error);
    });

    it('should throw an error if the update fails', async () => {
      const userEmail = 'somevalid@email.com';

      collection.updateOne.throws();

      await expect(
        subject.updateConfigurationForUser(userEmail, configuration)
      ).to.be.rejectedWith(Error);
    });

    it('should update the configuration', async () => {
      const userEmail = 'somevalid@email.com';

      await subject.updateConfigurationForUser(userEmail, configuration);

      expect(collection.updateOne.callCount).to.equal(1);
    });
  });
});
