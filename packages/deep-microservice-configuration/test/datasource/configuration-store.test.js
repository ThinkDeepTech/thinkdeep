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

  describe('configurationExists', () => {
    it('should throw an error if the user email is empty', (done) => {
      const userEmail = '';

      subject.configurationExists(userEmail).then(
        () => {
          done('An error was not thrown');
        },
        () => {
          done();
        }
      );
    });

    it('should throw an error if the user email is not a string', (done) => {
      const userEmail = [];
      subject.configurationExists(userEmail).then(
        () => {
          done('An error was not thrown');
        },
        () => {
          done();
        }
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
    it('should throw an error if the user email is empty', (done) => {
      const userEmail = '';

      subject.createConfigurationForUser(userEmail, configuration).then(
        () => {
          done('An error was not thrown');
        },
        () => {
          done();
        }
      );
    });

    it('should throw an error if the user email is not a string', (done) => {
      const userEmail = [];
      subject.createConfigurationForUser(userEmail, configuration).then(
        () => {
          done('An error was not thrown');
        },
        () => {
          done();
        }
      );
    });

    it('should throw an error if an invalid configuration is supplied', (done) => {
      const userEmail = 'somevalid@email.com';
      subject
        .createConfigurationForUser(userEmail, {observedEconomicEntities: null})
        .then(
          () => {
            done('An error was not thrown');
          },
          () => {
            done();
          }
        );
    });

    it('should throw an error if insertion fails', (done) => {
      const userEmail = 'somevalid@email.com';
      collection.insertOne.throws();

      subject.createConfigurationForUser(userEmail, configuration).then(
        () => {
          done('An error was not thrown');
        },
        () => {
          done();
        }
      );
    });

    it('should correctly insert the configuration', async () => {
      const userEmail = 'somevalid@email.com';
      await subject.createConfigurationForUser(userEmail, configuration);
      expect(collection.insertOne.callCount).to.equal(1);
    });
  });

  describe('readConfigurationForUser', () => {
    it('should throw an error if the user email is empty', (done) => {
      const userEmail = '';

      subject.readConfigurationForUser(userEmail).then(
        () => {
          done('An error was not thrown');
        },
        () => {
          done();
        }
      );
    });

    it('should throw an error if the user email is not a string', (done) => {
      const userEmail = [];
      subject.readConfigurationForUser(userEmail).then(
        () => {
          done('An error was not thrown');
        },
        () => {
          done();
        }
      );
    });

    it('should throw an error if a failure occurs during the read', (done) => {
      const userEmail = 'somevalid@email.com';
      collection.find.throws();

      subject.readConfigurationForUser(userEmail).then(
        () => {
          done('An error was not thrown');
        },
        () => {
          done();
        }
      );
    });

    it('should return the desired configuration', async () => {
      const userEmail = 'somevalid@email.com';
      const config = await subject.readConfigurationForUser(userEmail);
      expect(collection.find.callCount).to.equal(1);
      expect(config).to.equal(configuration);
    });
  });

  describe('updateConfigurationForUser', () => {
    it('should throw an error if the user email is empty', (done) => {
      const userEmail = '';

      subject.updateConfigurationForUser(userEmail, configuration).then(
        () => {
          done('An error was not thrown');
        },
        () => {
          done();
        }
      );
    });

    it('should throw an error if the user email is not a string', (done) => {
      const userEmail = [];
      subject.updateConfigurationForUser(userEmail, configuration).then(
        () => {
          done('An error was not thrown');
        },
        () => {
          done();
        }
      );
    });

    it('should throw an error if an invalid configuration is supplied', (done) => {
      const userEmail = 'somevalid@email.com';
      subject
        .updateConfigurationForUser(userEmail, {observedEconomicEntities: null})
        .then(
          () => {
            done('An error was not thrown');
          },
          () => {
            done();
          }
        );
    });

    it('should throw an error if the update fails', (done) => {
      const userEmail = 'somevalid@email.com';

      collection.updateOne.throws();

      subject.updateConfigurationForUser(userEmail, configuration).then(
        () => {
          done('An error was not thrown');
        },
        () => {
          done();
        }
      );
    });

    it('should update the configuration', async () => {
      const userEmail = 'somevalid@email.com';

      await subject.updateConfigurationForUser(userEmail, configuration);

      expect(collection.updateOne.callCount).to.equal(1);
    });
  });
});
