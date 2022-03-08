import {Command} from './command.mjs';
import {validString} from '../helpers.mjs';
import {k8s} from '@thinkdeep/k8s-tag';

class K8sCronJob extends Command {
    /**
     * Constructs a kubernetes cron job with the specified configuration.
     *
     * @param {Object} options - Options desired for cron job of the form: { name: 'cron-job-name', schedule: '* * * * *', image: 'busybox', command: 'ls', args: ['-l']}
     * @param {Object} logger - Logger object.
     */
    constructor(options, logger) {
        super();

        if (!validString(options.name) || !validString(options.schedule) || !validString(options.image) || !validString(options.command))
            throw new Error(`A cron job requires a name, schedule, image and command`);

        const cronjob = k8s`
            apiVersion: "batch/v1"
            kind: "CronJob"
            metadata:
                name: "${options.name}"
                namespace: "${options.namespace || "default"}"
            spec:
                schedule: "${options.schedule}"
                jobTemplate:
                    spec:
                        template:
                            spec:
                                containers:
                                    - name: "${process.env.HELM_RELEASE_NAME}-data-collector"
                                      image: "${options.image}"
                                      command: "${options.command}"
                                      args: ${options.args}
                                      envFrom:
                                        - secretRef:
                                            name: "${process.env.HELM_RELEASE_NAME}-deep-microservice-collection-secret"
                                        ${ process.env.PREDECOS_KAFKA_SECRET ? `
                                        - secretRef:
                                            name: "${process.env.PREDECOS_KAFKA_SECRET}"
                                        ` : ``}
                                serviceAccountName: "${process.env.HELM_RELEASE_NAME}-secret-accessor-service-account"
                                restartPolicy: "Never"
        `;

        logger.debug(`

            Configured cron job with manifest:

            ${cronJob.toString()}

        `);

        this._logger = logger;
        this._cronJob = cronJob;
    }

    /**
     * Execute the cron job.
     */
    async execute() {
        this._logger.info(`Creating cron job with metadata.name: ${this._cronJob.metadata.name}`);
        try {
            await this._cronJob.create();
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
        try {
            await this._api.deleteNamespacedCronJob(this._cronJob.metadata.name, this._namespace);
        } catch (e) {
            this._logger.error(`An error occurred while deleting cron job ${this._cronJob.metadata.name}: ${e.message.toString()}`);
        }
    }
}

export { K8sCronJob };