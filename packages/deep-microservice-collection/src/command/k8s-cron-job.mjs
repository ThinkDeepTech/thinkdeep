import {Command} from './command.mjs';
import {validString} from '../helpers.mjs';

class K8sCronJob extends Command {
    constructor(options, k8s) {
        super();

        if (!validString(options.name) || !validString(options.schedule) || !validString(options.command) ||
            !validString(options.image) || !validString(options.namespace) || !Array.isArray(options.args))
            throw new Error(`A cron job requires a name, schedule, command and arguments`);

        const cronJob = new k8s.V1CronJob();
        cronJob.apiVersion = "batch/v1";
        cronJob.kind = "CronJob";

        const metadata = new k8s.V1ObjectMeta({
            name: options.name
        });
        // metadata.name = options.name;
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
        container.args = options.args

        podSpec.containers = [ container ];
        podTemplateSpec.spec = podSpec;
        jobSpec.template = podTemplateSpec;
        jobTemplateSpec.spec = jobSpec;
        cronJobSpec.jobTemplate = jobTemplateSpec;
        cronJob.spec = cronJobSpec;

        const kubeConfig = new k8s.KubeConfig();
        const batchApi = kubeConfig.makeApiClient(k8s.BatchV1Api);

        this._cronJob = cronJob;
        this._api = batchApi;
        this._namespace = options.namespace;
    }

    async execute() {
        await this._api.createNamespacedCronJob(this._namespace, this._cronJob, "true");
    }

    async stop() {
        await this._api.deleteCollectionNamespacedCronJob(this._namespace, "true");
    }
}

export { K8sCronJob };