import {Command} from './command.mjs';
import {validString} from '../helpers.mjs';

class K8sJob extends Command {
    /**
     * Constructs a kubernetes job with the specified configuration.
     *
     * @param {Object} options - Options desired for job of the form: { name: 'job-name', image: 'busybox', command: 'ls', args: ['-l']}
     * @param {Object} k8s - Kubernetes javascript module import found at https://github.com/kubernetes-client/javascript
     * @param {Object} logger - Logger object.
     */
     constructor(options, k8s, logger) {
        super();

        if (!validString(options.name) || !validString(options.image) || !validString(options.command))
            throw new Error(`A job requires a name, image and command`);

        const job = new k8s.V1Job();
        job.apiVersion = "batch/v1";
        job.kind = "Job";

        const metadata = new k8s.V1ObjectMeta();
        metadata.name = options.name;
        job.metadata = metadata;

        const jobSpec = new k8s.V1JobSpec();
        const podTemplateSpec = new k8s.V1PodTemplateSpec();
        const podSpec = new k8s.V1PodSpec();

        const dockerSecretRef = new k8s.V1LocalObjectReference();
        dockerSecretRef.name = 'docker-secret';
        podSpec.imagePullSecrets = [dockerSecretRef];
        podSpec.restartPolicy = 'Never';

        const container = new k8s.V1Container();
        container.name = `${process.env.HELM_RELEASE_NAME}-data-collector`;
        container.image = options.image;
        container.command = [ options.command ];
        container.args = options.args || []

        let environmentConfigs = [];
        const collectionSecret = new k8s.V1EnvFromSource();
        const collectionSecretRef = new k8s.V1SecretEnvSource();
        collectionSecretRef.name = `${process.env.HELM_RELEASE_NAME}-deep-microservice-collection-secret`;
        collectionSecret.secretRef = collectionSecretRef;

        environmentConfigs.push(collectionSecret);

        if (process.env.PREDECOS_KAFKA_SECRET) {
            const kafkaSecret = new k8s.V1EnvFromSource();
            const kafkaSecretRef = new k8s.V1SecretEnvSource();
            kafkaSecretRef.name = `${process.env.PREDECOS_KAFKA_SECRET}`;
            kafkaSecret.secretRef = kafkaSecretRef;

            environmentConfigs.push(kafkaSecret);
        }

        container.envFrom = environmentConfigs;

        podSpec.containers = [ container ];
        podSpec.serviceAccountName = `${process.env.HELM_RELEASE_NAME}-secret-accessor-service-account`;
        podTemplateSpec.spec = podSpec;
        jobSpec.template = podTemplateSpec;
        job.spec = jobSpec;

        const kubeConfig = new k8s.KubeConfig();
        kubeConfig.loadFromCluster();
        const batchApi = kubeConfig.makeApiClient(k8s.BatchV1Api);

        logger.debug(`

            Configured job with metadata.name ${metadata.name}:

            ${JSON.stringify(job)}

        `);

        this._logger = logger;
        this._job = job;
        this._api = batchApi;
        this._namespace = options.namespace || 'default';
    }

    /**
     * Execute the job.
     */
    async execute() {
        this._logger.info(`Creating job with metadata.name: ${this._job.metadata.name}`);
        try {
            await this._api.createNamespacedJob(this._namespace, this._job, "true");
        } catch (e) {
            this._logger.error(`An error occurred while creating job ${this._job.metadata.name}: ${e.message.toString()}

            ${JSON.stringify(e)}

            `);
        }
    }

    /**
     * Stop the job.
     */
    async stop() {
        this._logger.info(`Deleting job with metadata.name: ${this._job.metadata.name}`);
        try {
            await this._api.deleteNamespacedJob(this._job.metadata.name, this._namespace);
        } catch (e) {
            this._logger.error(`An error occurred while deleting job ${this._job.metadata.name}: ${e.message.toString()}`);
        }
    }
}

export { K8sJob };