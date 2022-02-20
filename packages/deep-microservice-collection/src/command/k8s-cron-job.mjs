import {Command} from './command.mjs';
import {validString} from '../helpers.mjs';

class K8sCronJob extends Command {
    constructor(options, k8s, logger) {
        super();

        if (!validString(options.name) || !validString(options.schedule) || !validString(options.image) || !validString(options.command))
            throw new Error(`A cron job requires a name, schedule, image and command`);


        const cronJob = new k8s.V1CronJob();
        cronJob.apiVersion = "batch/v1";
        cronJob.kind = "CronJob";

        const metadata = new k8s.V1ObjectMeta();
        Object.defineProperty(metadata, "name", { writable: true });
        metadata.name = options.name;
        cronJob.metadata = metadata;

        const cronJobSpec = new k8s.V1CronJobSpec();
        cronJobSpec.schedule = options.schedule;
        const jobTemplateSpec = new k8s.V1JobTemplateSpec();
        const jobSpec = new k8s.V1JobSpec();
        const podTemplateSpec = new k8s.V1PodTemplateSpec();
        const podSpec = new k8s.V1PodSpec();

        const container = new k8s.V1Container();
        container.image = options.image;
        container.command = [ options.command ];
        container.args = options.args || []

        const envFromConfig = new k8s.V1EnvFromSource();
        const secretRef = new k8s.V1SecretEnvSource();

        /**
         * NOTE: This definition is required otherwise name can't be written to. It's a hack but it works.
         */
        Object.defineProperty(secretRef, "name", { writable: true });

        /**
         * NOTE: This name must match that in the secrets helm template. Otherwise, the cron job won't work.
         */
        secretRef.name = 'deep-microservice-collection-secrets';

        envFromConfig.secretRef = secretRef;
        container.envFrom = envFromConfig;

        podSpec.containers = [ container ];
        podTemplateSpec.spec = podSpec;
        jobSpec.template = podTemplateSpec;
        jobTemplateSpec.spec = jobSpec;
        cronJobSpec.jobTemplate = jobTemplateSpec;
        cronJob.spec = cronJobSpec;

        const kubeConfig = new k8s.KubeConfig();
        kubeConfig.loadFromCluster();
        const batchApi = kubeConfig.makeApiClient(k8s.BatchV1Api);

        logger.debug(`Configured cron job with metadata.name ${metadata.name} which will reference secret ${secretRef.name}`);

        this._logger = logger;
        this._cronJob = cronJob;
        this._api = batchApi;
        this._namespace = options.namespace || 'default';
    }

    async execute() {
        this._logger.info(`Creating cron job with metadata.name: ${this._cronJob.metadata.name}`);
        await this._api.createNamespacedCronJob(this._namespace, this._cronJob, "true");
    }

    async stop() {
        this._logger.info(`Deleting cron job with metadata.name: ${this._cronJob.metadata.name}`);
        await this._api.deleteCollectionNamespacedCronJob(this._namespace, "true");
    }
}

export { K8sCronJob };