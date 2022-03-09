import k8s from '@kubernetes/client-node';
import chai, { assert } from 'chai';
import sinon from 'sinon';
import sinonChai from 'sinon-chai';

const expect = chai.expect;
chai.use(sinonChai);

import { K8sCronJob } from '../../src/command/k8s-cron-job.mjs';

describe('k8s-cron-job', () => {

    let options = {
        name: 'fetch-tweets-google-business',
        schedule: '* * * * *',
        image: 'busybox',
        namespace: 'default',
        command: 'node'
    };
    let logger;
    let k8sApiClient;
    let mockK8s;
    let subject;
    beforeEach(() => {

        logger = {
            debug: sinon.stub(),
            info: sinon.stub(),
            warn: sinon.stub(),
            error: sinon.stub()
        };

        mockK8s = {
            V1CronJob: sinon.stub(),
            V1ObjectMeta: sinon.stub(),
            V1CronJobSpec: sinon.stub(),
            V1JobTemplateSpec: sinon.stub(),
            V1JobSpec: sinon.stub(),
            V1PodTemplateSpec: sinon.stub(),
            V1PodSpec: sinon.stub(),
            V1LocalObjectReference: sinon.stub(),
            V1Container: sinon.stub(),
            V1EnvFromSource: sinon.stub(),
            V1SecretEnvSource: sinon.stub(),
            KubeConfig: sinon.stub()
        };

        mockK8s.V1CronJob.returns( sinon.createStubInstance(k8s.V1CronJob.constructor) );
        mockK8s.V1CronJobSpec.returns( sinon.createStubInstance(k8s.V1CronJobSpec.constructor) );
        mockK8s.V1JobTemplateSpec.returns( sinon.createStubInstance(k8s.V1JobTemplateSpec.constructor) );
        mockK8s.V1JobSpec.returns( sinon.createStubInstance(k8s.V1JobSpec.constructor) );
        mockK8s.V1PodTemplateSpec.returns( sinon.createStubInstance(k8s.V1PodTemplateSpec.constructor) );
        mockK8s.V1PodSpec.returns( sinon.createStubInstance(k8s.V1PodSpec.constructor) );
        mockK8s.V1EnvFromSource.returns( sinon.createStubInstance(k8s.V1EnvFromSource.constructor) );

        /**
         * NOTE: Oddly, createStubInstance seems to be creating an object with a readonly name
         * property. Therefore, I have to overwrite that for the tests to run properly. The system
         * works properly when deployed.
         */
        const metadata = sinon.createStubInstance(k8s.V1ObjectMeta.constructor);
        Object.defineProperty(metadata, "name", { writable: true });
        mockK8s.V1ObjectMeta.returns( metadata );

        const container = sinon.createStubInstance(k8s.V1Container.constructor);
        Object.defineProperty(container, "name", { writable: true });
        mockK8s.V1Container.returns( container );

        const secretRef = sinon.createStubInstance(k8s.V1SecretEnvSource.constructor);
        Object.defineProperty(secretRef, "name", { writable: true });
        mockK8s.V1SecretEnvSource.returns( secretRef );

        const dockerSecret = sinon.createStubInstance(k8s.V1LocalObjectReference.constructor);
        Object.defineProperty(dockerSecret, "name", { writable: true });
        mockK8s.V1LocalObjectReference.returns( dockerSecret );

        k8sApiClient = {
            createNamespacedCronJob: sinon.stub(),
            deleteNamespacedCronJob: sinon.stub()
        }
        const kubeConfig = sinon.createStubInstance(k8s.KubeConfig.constructor);
        kubeConfig.loadFromCluster = sinon.stub();
        kubeConfig.makeApiClient = sinon.stub().returns(k8sApiClient)
        mockK8s.KubeConfig.returns( kubeConfig );
    });

    describe('constructor', () => {

        const requiredOptionsErrorMessage = "A cron job requires a name, schedule, image and command";

        it('should throw an error if the name is empty', () => {
            try {
                subject = new K8sCronJob({
                    name: '',
                    schedule: '* * * * *',
                    image: 'busybox',
                    namespace: 'default',
                    command: 'node'
                }, mockK8s, logger);
                assert.fail('An error should have been thrown.');
            } catch (e) {
                expect(e.message.toString()).to.equal(requiredOptionsErrorMessage);
            }
        })

        it('should throw an error if the name is not a string', () => {
            try {
                subject = new K8sCronJob({
                    name: 1,
                    schedule: '* * * * *',
                    image: 'busybox',
                    namespace: 'default',
                    command: 'node'
                }, mockK8s, logger);
                assert.fail('An error should have been thrown.');
            } catch (e) {
                expect(e.message.toString()).to.equal(requiredOptionsErrorMessage);
            }
        })

        it('should throw an error if the schedule is empty', () => {
            try {
                subject = new K8sCronJob({
                    name: 'fetch-tweets-google-business',
                    schedule: '',
                    image: 'busybox',
                    namespace: 'default',
                    command: 'node'
                }, mockK8s, logger);
                assert.fail('An error should have been thrown.');
            } catch (e) {
                expect(e.message.toString()).to.equal(requiredOptionsErrorMessage);
            }
        })

        it('should throw an error if the schedule is not a string', () => {
            try {
                subject = new K8sCronJob({
                    name: 'fetch-tweets-google-business',
                    schedule: [],
                    image: 'busybox',
                    namespace: 'default',
                    command: 'node'
                }, mockK8s, logger);
                assert.fail('An error should have been thrown.');
            } catch (e) {
                expect(e.message.toString()).to.equal(requiredOptionsErrorMessage);
            }
        })

        it('should throw an error if the image is empty', () => {
            try {
                subject = new K8sCronJob({
                    name: 'fetch-tweets-google-business',
                    schedule: '* * * * *',
                    image: '',
                    namespace: 'default',
                    command: 'node'
                }, mockK8s, logger);
                assert.fail('An error should have been thrown.');
            } catch (e) {
                expect(e.message.toString()).to.equal(requiredOptionsErrorMessage);
            }
        })

        it('should throw an error if the image is not a string', () => {
            try {
                subject = new K8sCronJob({
                    name: 'fetch-tweets-google-business',
                    schedule: '* * * * *',
                    image: {},
                    namespace: 'default',
                    command: 'node'
                }, mockK8s, logger);
                assert.fail('An error should have been thrown.');
            } catch (e) {
                expect(e.message.toString()).to.equal(requiredOptionsErrorMessage);
            }
        })

        it('should throw an error if the command is empty', () => {
            try {
                subject = new K8sCronJob({
                    name: 'fetch-tweets-google-business',
                    schedule: '* * * * *',
                    image: 'busybox',
                    namespace: 'default',
                    command: ''
                }, mockK8s, logger);
                assert.fail('An error should have been thrown.');
            } catch (e) {
                expect(e.message.toString()).to.equal(requiredOptionsErrorMessage);
            }
        })

        it('should throw an error if the command is not a string', () => {
            try {
                subject = new K8sCronJob({
                    name: 'fetch-tweets-google-business',
                    schedule: '* * * * *',
                    image: 'busybox',
                    namespace: 'default',
                    command: 1
                }, mockK8s, logger);
                assert.fail('An error should have been thrown.');
            } catch (e) {
                expect(e.message.toString()).to.equal(requiredOptionsErrorMessage);
            }
        })
    })
});