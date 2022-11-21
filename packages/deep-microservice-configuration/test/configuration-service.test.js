import chai from 'chai';
import sinon from 'sinon';
import sinonChai from 'sinon-chai';

import {ConfigurationService} from '../src/configuration-service.js';
import {ConfigurationStore} from '../src/datasource/configuration-store.js';
const expect = chai.expect;
chai.use(sinonChai);

describe('configuration-service', () => {
  const isDefaultReturnValue = (target) => {
    return (
      !!target &&
      !!target?.observedEconomicEntities &&
      target.observedEconomicEntities.length === 0
    );
  };

  let subject;
  let configurationStore;
  let logger;
  beforeEach(() => {
    configurationStore = sinon.createStubInstance(ConfigurationStore);

    logger = {
      debug: sinon.stub(),
      info: sinon.stub(),
      warn: sinon.stub(),
      error: sinon.stub(),
    };

    subject = new ConfigurationService(configurationStore, logger);
  });

  describe('getOrCreateConfiguration', () => {
    it('should return default object if the userEmail is empty', async () => {
      const userEmail = '';
      const permissions = {
        scope: 'read:all',
      };
      const me = {
        email: 'someuser@email.com',
      };

      const actual = await subject.getOrCreateConfiguration(
        userEmail,
        permissions,
        me
      );

      expect(isDefaultReturnValue(actual)).to.equal(true);
    });

    it('should return default object if the userEmail is not a string', async () => {
      const userEmail = {};
      const permissions = {
        scope: 'read:all',
      };
      const me = {
        email: 'someuser@email.com',
      };

      const actual = await subject.getOrCreateConfiguration(
        userEmail,
        permissions,
        me
      );

      expect(isDefaultReturnValue(actual)).to.equal(true);
    });

    it('should return default object if the user does not have read:all access', async () => {
      const userEmail = 'someuser@email.com';
      const permissions = {
        scope: 'profile email',
      };
      const me = {
        email: 'someuser@email.com',
      };

      const actual = await subject.getOrCreateConfiguration(
        userEmail,
        permissions,
        me
      );

      expect(isDefaultReturnValue(actual)).to.equal(true);
    });

    it('should return the default object if the user is attempting to fetch configurations for a different user', async () => {
      const userEmail = 'anotheruser@email.com';
      const permissions = {
        scope: 'profile email',
      };
      const me = {
        email: 'someuser@email.com',
      };

      const actual = await subject.getOrCreateConfiguration(
        userEmail,
        permissions,
        me
      );

      expect(isDefaultReturnValue(actual)).to.equal(true);
    });

    it('should create a configuration for the user if they do not already have one', async () => {
      const userEmail = 'someuser@email.com';
      const permissions = {
        scope: 'profile email read:all',
      };
      const me = {
        email: 'someuser@email.com',
      };
      configurationStore.configurationExists.returns(Promise.resolve(false));

      await subject.getOrCreateConfiguration(userEmail, permissions, me);

      expect(configurationStore.createConfigurationForUser.callCount).to.equal(
        1
      );
    });

    it('should read the configuration for the specified user', async () => {
      const userEmail = 'someuser@email.com';
      const permissions = {
        scope: 'profile email read:all',
      };
      const me = {
        email: 'someuser@email.com',
      };
      configurationStore.configurationExists.returns(Promise.resolve(true));

      await subject.getOrCreateConfiguration(userEmail, permissions, me);

      expect(configurationStore.readConfigurationForUser.callCount).to.equal(1);
    });
  });

  describe('updateConfiguration', () => {
    it('should return default object if the userEmail is empty', async () => {
      const userEmail = '';
      const permissions = {
        scope: 'read:all',
      };
      const me = {
        email: 'someuser@email.com',
      };
      const observedEconomicEntities = [
        {
          name: 'SomeBusiness',
          type: 'BUSINESS',
        },
      ];

      const actual = await subject.updateConfiguration(
        userEmail,
        observedEconomicEntities,
        permissions,
        me
      );

      expect(isDefaultReturnValue(actual)).to.equal(true);
    });

    it('should return default object if the userEmail is not a string', async () => {
      const userEmail = 1;
      const permissions = {
        scope: 'read:all',
      };
      const me = {
        email: 'someuser@email.com',
      };
      const observedEconomicEntities = [
        {
          name: 'SomeBusiness',
          type: 'BUSINESS',
        },
      ];

      const actual = await subject.updateConfiguration(
        userEmail,
        observedEconomicEntities,
        permissions,
        me
      );

      expect(isDefaultReturnValue(actual)).to.equal(true);
    });

    it('should return default object if the user does not have read:all access', async () => {
      const userEmail = 'someuser@email.com';
      const permissions = {
        scope: 'profile email',
      };
      const me = {
        email: 'someuser@email.com',
      };
      const observedEconomicEntities = [
        {
          name: 'SomeBusiness',
          type: 'BUSINESS',
        },
      ];

      const actual = await subject.updateConfiguration(
        userEmail,
        observedEconomicEntities,
        permissions,
        me
      );

      expect(isDefaultReturnValue(actual)).to.equal(true);
    });

    it('should return the default object if the user is attempting to fetch configurations for a different user', async () => {
      const userEmail = 'anotheruser@email.com';
      const permissions = {
        scope: 'read:all',
      };
      const me = {
        email: 'someuser@email.com',
      };
      const observedEconomicEntities = [
        {
          name: 'SomeBusiness',
          type: 'BUSINESS',
        },
      ];

      const actual = await subject.updateConfiguration(
        userEmail,
        observedEconomicEntities,
        permissions,
        me
      );

      expect(isDefaultReturnValue(actual)).to.equal(true);
    });

    it('should return the previous configuration if the user is attempting to update observed economic entities to a non-array object', async () => {
      const userEmail = 'someuser@email.com';
      const permissions = {
        scope: 'read:all',
      };
      const me = {
        email: 'someuser@email.com',
      };
      const observedEconomicEntities = 'nonarray';

      await subject.updateConfiguration(
        userEmail,
        observedEconomicEntities,
        permissions,
        me
      );

      expect(configurationStore.readConfigurationForUser.callCount).to.equal(1);
    });

    it('should update the configuration and return it', async () => {
      const userEmail = 'someuser@email.com';
      const permissions = {
        scope: 'read:all',
      };
      const me = {
        email: 'someuser@email.com',
      };
      const observedEconomicEntities = [
        {
          name: 'SomeBusiness',
          type: 'BUSINESS',
        },
      ];

      await subject.updateConfiguration(
        userEmail,
        observedEconomicEntities,
        permissions,
        me
      );

      expect(configurationStore.updateConfigurationForUser.callCount).to.equal(
        1
      );
      expect(configurationStore.readConfigurationForUser.callCount).to.equal(1);
    });
  });
});
