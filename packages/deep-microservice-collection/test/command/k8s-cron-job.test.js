/* eslint-disable no-new */

import chai, {assert} from 'chai';
import sinon from 'sinon';
import sinonChai from 'sinon-chai';

import {K8sCronJob} from '../../src/command/k8s-cron-job.js';

const expect = chai.expect;
chai.use(sinonChai);

describe('k8s-cron-job', () => {
  let logger;
  beforeEach(() => {
    logger = {
      debug: sinon.stub(),
      info: sinon.stub(),
      warn: sinon.stub(),
      error: sinon.stub(),
    };
  });

  describe('constructor', () => {
    const requiredOptionsErrorMessage =
      'A cron job requires a name, schedule and a valid operation to perform.';

    it('should throw an error if the name is empty', () => {
      try {
        new K8sCronJob(
          {
            name: '',
            schedule: '* * * * *',
            image: 'busybox',
            namespace: 'default',
            command: 'node',
          },
          logger
        );
        assert.fail('An error should have been thrown.');
      } catch (e) {
        expect(e.message.toString()).to.equal(requiredOptionsErrorMessage);
      }
    });

    it('should throw an error if the name is not a string', () => {
      try {
        new K8sCronJob(
          {
            name: 1,
            schedule: '* * * * *',
            image: 'busybox',
            namespace: 'default',
            command: 'node',
          },
          logger
        );
        assert.fail('An error should have been thrown.');
      } catch (e) {
        expect(e.message.toString()).to.equal(requiredOptionsErrorMessage);
      }
    });

    it('should throw an error if the schedule is empty', () => {
      try {
        new K8sCronJob(
          {
            name: 'fetch-tweets-google-business',
            schedule: '',
            image: 'busybox',
            namespace: 'default',
            command: 'node',
          },
          logger
        );
        assert.fail('An error should have been thrown.');
      } catch (e) {
        expect(e.message.toString()).to.equal(requiredOptionsErrorMessage);
      }
    });

    it('should throw an error if the schedule is not a string', () => {
      try {
        new K8sCronJob(
          {
            name: 'fetch-tweets-google-business',
            schedule: [],
            image: 'busybox',
            namespace: 'default',
            command: 'node',
          },
          logger
        );
        assert.fail('An error should have been thrown.');
      } catch (e) {
        expect(e.message.toString()).to.equal(requiredOptionsErrorMessage);
      }
    });

    it('should throw an error if the image is empty', () => {
      try {
        new K8sCronJob(
          {
            name: 'fetch-tweets-google-business',
            schedule: '* * * * *',
            image: '',
            namespace: 'default',
            command: 'node',
          },
          logger
        );
        assert.fail('An error should have been thrown.');
      } catch (e) {
        expect(e.message.toString()).to.equal(requiredOptionsErrorMessage);
      }
    });

    it('should throw an error if the image is not a string', () => {
      try {
        new K8sCronJob(
          {
            name: 'fetch-tweets-google-business',
            schedule: '* * * * *',
            image: {},
            namespace: 'default',
            command: 'node',
          },
          logger
        );
        assert.fail('An error should have been thrown.');
      } catch (e) {
        expect(e.message.toString()).to.equal(requiredOptionsErrorMessage);
      }
    });

    it('should throw an error if the command is empty', () => {
      try {
        new K8sCronJob(
          {
            name: 'fetch-tweets-google-business',
            schedule: '* * * * *',
            image: 'busybox',
            namespace: 'default',
            command: '',
          },
          logger
        );
        assert.fail('An error should have been thrown.');
      } catch (e) {
        expect(e.message.toString()).to.equal(requiredOptionsErrorMessage);
      }
    });

    it('should throw an error if the command is not a string', () => {
      try {
        new K8sCronJob(
          {
            name: 'fetch-tweets-google-business',
            schedule: '* * * * *',
            image: 'busybox',
            namespace: 'default',
            command: 1,
          },
          logger
        );
        assert.fail('An error should have been thrown.');
      } catch (e) {
        expect(e.message.toString()).to.equal(requiredOptionsErrorMessage);
      }
    });
  });
});
