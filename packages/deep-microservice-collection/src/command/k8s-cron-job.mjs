import {Command} from './command.mjs';
import {validString} from '../helpers.mjs';

class K8sCronJob extends Command {
    /**
     * Constructs a kubernetes cron job with the specified configuration.
     *
     * @param {Object} options - Options desired for cron job of the form: { name: 'cron-job-name', schedule: '* * * * *', image: 'busybox', command: 'ls', args: ['-l']}
     * @param {Object} k8s - Kubernetes javascript module import found at https://github.com/kubernetes-client/javascript
     * @param {Object} logger - Logger object.
     */
    constructor(options, k8s, logger) {
        super();

        if (!validString(options.name) || !validString(options.schedule) || !validString(options.image) || !validString(options.command))
            throw new Error(`A cron job requires a name, schedule, image and command`);


        const cronJob = new k8s.V1CronJob();
        cronJob.apiVersion = "batch/v1";
        cronJob.kind = "CronJob";

        const metadata = new k8s.V1ObjectMeta();
        metadata.name = options.name;
        cronJob.metadata = metadata;

        const cronJobSpec = new k8s.V1CronJobSpec();
        cronJobSpec.schedule = options.schedule;
        const jobTemplateSpec = new k8s.V1JobTemplateSpec();
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

        const envFromConfig = new k8s.V1EnvFromSource();
        const secretRef = new k8s.V1SecretEnvSource();
        secretRef.name = `${process.env.HELM_RELEASE_NAME}-secrets`;

        envFromConfig.secretRef = secretRef;
        container.envFrom = [envFromConfig];

        podSpec.containers = [ container ];
        podSpec.serviceAccountName = `${process.env.HELM_RELEASE_NAME}-secret-accessor-service-account`;
        podTemplateSpec.spec = podSpec;
        jobSpec.template = podTemplateSpec;
        jobTemplateSpec.spec = jobSpec;
        cronJobSpec.jobTemplate = jobTemplateSpec;
        cronJob.spec = cronJobSpec;

        const kubeConfig = new k8s.KubeConfig();
        kubeConfig.loadFromCluster();
        const batchApi = kubeConfig.makeApiClient(k8s.BatchV1Api);

        logger.debug(`

            Configured cron job with metadata.name ${metadata.name} which will reference secret ${secretRef.name} and use service account ${podSpec.serviceAccountName}:

            ${JSON.stringify(cronJob)}

        `);

        this._logger = logger;
        this._cronJob = cronJob;
        this._api = batchApi;
        this._namespace = options.namespace || 'default';
    }

    /**
     * Execute the cron job.
     */
    async execute() {
        this._logger.info(`Creating cron job with metadata.name: ${this._cronJob.metadata.name}`);
        try {
            await this._api.createNamespacedCronJob(this._namespace, this._cronJob, "true");
        } catch (e) {
            this._logger.error(`An error occurred while creating cron job ${this._cronJob.metadata.name}: ${e.message.toString()}

            ${JSON.stringify(e)}

            `);
        }
    }

    /**
     * Stop the cron job.
     */
    async stop() {
        this._logger.info(`Deleting cron job with metadata.name: ${this._cronJob.metadata.name}`);
        await this._api.deleteNamespacedCronJob(this._cronJob.metadata.name, this._namespace);
    }
}

export { K8sCronJob };