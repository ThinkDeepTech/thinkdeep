import k8s from '@kubernetes/client-node';
import chai, { assert } from 'chai';
import sinon from 'sinon';
import sinonChai from 'sinon-chai';

const expect = chai.expect;
chai.use(sinonChai);

import { K8sCronJob } from '../../src/command/k8s-cron-job.mjs';

describe('collection-service', () => {

    let options = {
        schedule: '* * * * *',
        image: 'busybox',
        namespace: 'default',
        command: 'node'
    };
    let k8sApiClient;
    let mockK8s;
    let subject;
    beforeEach(() => {

        mockK8s = {
            V1CronJob: sinon.stub(),
            V1ObjectMeta: sinon.stub(),
            V1CronJobSpec: sinon.stub(),
            V1JobTemplateSpec: sinon.stub(),
            V1JobSpec: sinon.stub(),
            V1PodTemplateSpec: sinon.stub(),
            V1PodSpec: sinon.stub(),
            V1Container: sinon.stub(),
            KubeConfig: sinon.stub()
        };

        mockK8s.V1CronJob.returns( sinon.createStubInstance(k8s.V1CronJob.constructor) );
        mockK8s.V1ObjectMeta.returns( sinon.createStubInstance(k8s.V1ObjectMeta.constructor) );
        mockK8s.V1CronJobSpec.returns( sinon.createStubInstance(k8s.V1CronJobSpec.constructor) );
        mockK8s.V1JobTemplateSpec.returns( sinon.createStubInstance(k8s.V1JobTemplateSpec.constructor) );
        mockK8s.V1JobSpec.returns( sinon.createStubInstance(k8s.V1JobSpec.constructor) );
        mockK8s.V1PodTemplateSpec.returns( sinon.createStubInstance(k8s.V1PodTemplateSpec.constructor) );
        mockK8s.V1PodSpec.returns( sinon.createStubInstance(k8s.V1PodSpec.constructor) );
        mockK8s.V1Container.returns( sinon.createStubInstance(k8s.V1Container.constructor) );

        k8sApiClient = {
            createNamespacedCronJob: sinon.stub(),
            deleteCollectionNamespacedCronJob: sinon.stub()
        }
        const kubeConfig = sinon.createStubInstance(k8s.KubeConfig.constructor);
        kubeConfig.makeApiClient = sinon.stub().returns(k8sApiClient)
        mockK8s.KubeConfig.returns( kubeConfig );
    });

    describe('constructor', () => {

        it('should throw an error if the schedule is empty', () => {
            try {
                subject = new K8sCronJob({
                    schedule: '',
                    image: 'busybox',
                    namespace: 'default',
                    command: 'node'
                }, mockK8s);
                assert.fail('An error should have been thrown.');
            } catch (e) {
                expect(e.message.toString()).to.equal(`A cron job requires a schedule, image and command`);
            }
        })

        it('should throw an error if the schedule is not a string', () => {
            try {
                subject = new K8sCronJob({
                    schedule: [],
                    image: 'busybox',
                    namespace: 'default',
                    command: 'node'
                }, mockK8s);
                assert.fail('An error should have been thrown.');
            } catch (e) {
                expect(e.message.toString()).to.equal(`A cron job requires a schedule, image and command`);
            }
        })

        it('should throw an error if the image is empty', () => {
            try {
                subject = new K8sCronJob({
                    schedule: '* * * * *',
                    image: '',
                    namespace: 'default',
                    command: 'node'
                }, mockK8s);
                assert.fail('An error should have been thrown.');
            } catch (e) {
                expect(e.message.toString()).to.equal(`A cron job requires a schedule, image and command`);
            }
        })

        it('should throw an error if the image is not a string', () => {
            try {
                subject = new K8sCronJob({
                    schedule: '* * * * *',
                    image: {},
                    namespace: 'default',
                    command: 'node'
                }, mockK8s);
                assert.fail('An error should have been thrown.');
            } catch (e) {
                expect(e.message.toString()).to.equal(`A cron job requires a schedule, image and command`);
            }
        })

        it('should throw an error if the command is empty', () => {
            try {
                subject = new K8sCronJob({
                    schedule: '* * * * *',
                    image: 'busybox',
                    namespace: 'default',
                    command: ''
                }, mockK8s);
                assert.fail('An error should have been thrown.');
            } catch (e) {
                expect(e.message.toString()).to.equal(`A cron job requires a schedule, image and command`);
            }
        })

        it('should throw an error if the command is not a string', () => {
            try {
                subject = new K8sCronJob({
                    schedule: '* * * * *',
                    image: 'busybox',
                    namespace: 'default',
                    command: 1
                }, mockK8s);
                assert.fail('An error should have been thrown.');
            } catch (e) {
                expect(e.message.toString()).to.equal(`A cron job requires a schedule, image and command`);
            }
        })

        it('should construct an object of the correct structure for a k8s cron job', () => {

            subject = new K8sCronJob(options, mockK8s);

            /**
             * The structure of the created cron job should be what's expected by k8s. If any point in the chain
             * fails it's known that the structure is incorrect.
             */
            expect(subject._cronJob.spec.schedule).not.to.equal(undefined);
            expect(subject._cronJob.spec.jobTemplate.spec.template.spec.containers[0].args).not.to.equal(undefined);
        })
    })

    describe('execute', () => {
        it('should create a cron job', async () => {
            subject = new K8sCronJob(options, mockK8s);
            await subject.execute();
            expect(k8sApiClient.createNamespacedCronJob).to.have.been.called;
        })
    })

    describe('stop', () => {
        it('should delete the cron job', async () => {
            subject = new K8sCronJob(options, mockK8s);
            await subject.stop();
            expect(k8sApiClient.deleteCollectionNamespacedCronJob).to.have.been.called;
        })
    })
});