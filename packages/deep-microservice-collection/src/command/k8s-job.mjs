import {Command} from './command.mjs';
import {validString} from '../helpers.mjs';
import {k8s} from '@thinkdeep/k8s-tag';

class K8sJob extends Command {
    /**
     * Constructs a kubernetes job with the specified configuration.
     *
     * @param {Object} options - Options desired for job of the form: { name: 'job-name', image: 'busybox', command: 'ls', args: ['-l']}
     * @param {Object} logger - Logger object.
     */
     constructor(options, logger) {
        super();

        if (!validString(options.name) || !validString(options.image) || !validString(options.command))
            throw new Error(`A job requires a name, image and command`);

            const job = k8s`
                apiVersion: "batch/v1"
                kind: "Job"
                metadata:
                    name: "${options.name}"
                    namespace: "${options.namespace || "default"}"
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

            Configured job with manifest:

            ${job.toString()}

        `);

        this._logger = logger;
        this._job = job;
    }

    /**
     * Execute the job.
     */
    async execute() {
        this._logger.info(`Creating job.`);
        try {
            await this._job.create();
        } catch (e) {
            this._logger.error(`An error occurred while creating job: ${e.message.toString()}`);
        }
    }

    /**
     * Stop the job.
     */
    async stop() {
        this._logger.info(`Deleting job.`);
        try {
            await this._job.delete();
        } catch (e) {
            this._logger.error(`An error occurred while deleting job: ${e.message.toString()}`);
        }
    }
}

export { K8sJob };