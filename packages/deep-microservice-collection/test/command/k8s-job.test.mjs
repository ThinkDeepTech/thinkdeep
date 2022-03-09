import chai, { assert } from 'chai';
import sinon from 'sinon';
import sinonChai from 'sinon-chai';

const expect = chai.expect;
chai.use(sinonChai);

import { K8sJob } from '../../src/command/k8s-job.mjs';

describe('k8s-job', () => {

    let logger;
    beforeEach(() => {

        logger = {
            debug: sinon.stub(),
            info: sinon.stub(),
            warn: sinon.stub(),
            error: sinon.stub()
        };
    });

    describe('constructor', () => {

        const requiredOptionsErrorMessage = "A job requires a name, image and command";

        it('should throw an error if the name is empty', () => {
            try {
                new K8sJob({
                    name: '',
                    image: 'busybox',
                    namespace: 'default',
                    command: 'node'
                }, logger);
                assert.fail('An error should have been thrown.');
            } catch (e) {
                expect(e.message.toString()).to.equal(requiredOptionsErrorMessage);
            }
        })

        it('should throw an error if the name is not a string', () => {
            try {
                new K8sJob({
                    name: 1,
                    image: 'busybox',
                    namespace: 'default',
                    command: 'node'
                }, logger);
                assert.fail('An error should have been thrown.');
            } catch (e) {
                expect(e.message.toString()).to.equal(requiredOptionsErrorMessage);
            }
        })

        it('should throw an error if the image is empty', () => {
            try {
                new K8sJob({
                    name: 'fetch-tweets-google-business',
                    image: '',
                    namespace: 'default',
                    command: 'node'
                }, logger);
                assert.fail('An error should have been thrown.');
            } catch (e) {
                expect(e.message.toString()).to.equal(requiredOptionsErrorMessage);
            }
        })

        it('should throw an error if the image is not a string', () => {
            try {
                new K8sJob({
                    name: 'fetch-tweets-google-business',
                    image: {},
                    namespace: 'default',
                    command: 'node'
                }, logger);
                assert.fail('An error should have been thrown.');
            } catch (e) {
                expect(e.message.toString()).to.equal(requiredOptionsErrorMessage);
            }
        })

        it('should throw an error if the command is empty', () => {
            try {
                new K8sJob({
                    name: 'fetch-tweets-google-business',
                    image: 'busybox',
                    namespace: 'default',
                    command: ''
                }, logger);
                assert.fail('An error should have been thrown.');
            } catch (e) {
                expect(e.message.toString()).to.equal(requiredOptionsErrorMessage);
            }
        })

        it('should throw an error if the command is not a string', () => {
            try {
                new K8sJob({
                    name: 'fetch-tweets-google-business',
                    image: 'busybox',
                    namespace: 'default',
                    command: 1
                }, logger);
                assert.fail('An error should have been thrown.');
            } catch (e) {
                expect(e.message.toString()).to.equal(requiredOptionsErrorMessage);
            }
        })
    })
});