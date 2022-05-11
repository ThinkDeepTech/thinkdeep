import assert from 'assert';
import chai from 'chai';
import sinon from 'sinon';
import sinonChai from 'sinon-chai';

import {Commander} from '../src/commander.js';

chai.use(sinonChai);
const expect = chai.expect;

describe('commander', () => {
  let logger;
  let subject;
  let commands;
  beforeEach(() => {
    logger = {
      debug: sinon.stub(),
      info: sinon.stub(),
      warn: sinon.stub(),
      error: sinon.stub(),
    };

    commands = [
      {
        execute: sinon.stub(),
        stop: sinon.stub(),
      },
      {
        execute: sinon.stub(),
        stop: sinon.stub(),
      },
      {
        execute: sinon.stub(),
        stop: sinon.stub(),
      },
    ];

    subject = new Commander(logger);
  });

  describe('execute', () => {
    it('should throw an error if the key is empty', async () => {
      try {
        await subject.execute('', commands);
        assert.fail(['Expected an error but none were thrown.']);
      } catch (e) {
        expect(e.message).to.equal(`Key must be a valid string. Received: `);
      }
    });

    it('should throw an error if the key is not a string', async () => {
      try {
        await subject.execute(1, commands);
        assert.fail(['Expected an error but none were thrown.']);
      } catch (e) {
        expect(e.message).to.equal(`Key must be a valid string. Received: 1`);
      }
    });

    it('should do nothing if commands is not an array', async () => {
      await subject.execute('key', {});
      expect(logger.info.callCount).to.equal(0);
    });

    it('should track commands', async () => {
      await subject.execute('key', commands);
      expect(subject._commandMap.key).to.equal(commands);
    });

    it('should execute the commands', async () => {
      await subject.execute('key', commands);

      expect(commands[0].execute.callCount).to.equal(1);
      expect(commands[1].execute.callCount).to.equal(1);
      expect(commands[2].execute.callCount).to.equal(1);
    });
  });

  describe('stopAllCommands', () => {
    it('should stop each command', async () => {
      await subject.execute('key', commands);

      await subject.stopAllCommands();

      expect(commands[0].stop.callCount).to.equal(1);
      expect(commands[1].stop.callCount).to.equal(1);
      expect(commands[2].stop.callCount).to.equal(1);
    });
  });

  describe('_stopCommands', () => {
    it('should stop each command', async () => {
      await subject._stopCommands(commands);

      expect(commands[0].stop.callCount).to.equal(1);
      expect(commands[1].stop.callCount).to.equal(1);
      expect(commands[2].stop.callCount).to.equal(1);
    });
  });

  describe('_addCommands', () => {
    it('should throw an error if the key is empty', () => {
      try {
        subject._addCommands('', commands);
        assert.fail(['Expected an error but none were thrown.']);
      } catch (e) {
        expect(e.message).to.equal(`Key must be valid but was not. Received: `);
      }
    });

    it('should throw an error if the key is not a string', () => {
      try {
        subject._addCommands(1, commands);
        assert.fail(['Expected an error but none were thrown.']);
      } catch (e) {
        expect(e.message).to.equal(
          `Key must be valid but was not. Received: 1`
        );
      }
    });

    it('should do nothing if commands is not an array', () => {
      subject._addCommands('key', 'thing');
      expect(logger.info.callCount).to.equal(0);
    });

    it('should add commands with a valid key into the map', () => {
      const key = 'key';
      subject._addCommands(key, commands);
      expect(subject._commandMap[key]).to.equal(commands);
    });
  });

  describe('_commands', () => {
    it('should throw an error if the key is empty', () => {
      try {
        subject._commands('');
        assert.fail(['Expected an error but none were thrown.']);
      } catch (e) {
        expect(e.message).to.equal(`Key must be valid but was not. Received: `);
      }
    });

    it('should throw an error if the key is not a string', () => {
      try {
        subject._commands(1);
        assert.fail(['Expected an error but none were thrown.']);
      } catch (e) {
        expect(e.message).to.equal(
          `Key must be valid but was not. Received: 1`
        );
      }
    });
  });
});