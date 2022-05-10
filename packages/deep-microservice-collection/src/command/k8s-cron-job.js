import {Command} from './command.js';
import {validString} from '../helpers.js';
import {stringify} from '@thinkdeep/k8s';

/**
 * Represents a kubernetes cron job.
 */
class K8sCronJob extends Command {
    /**
     * Constructs a kubernetes cron job with the specified configuration.
     *
     * @param {Object} options - Options desired for cron job of the form: { name: 'cron-job-name', schedule: '* * * * *', image: 'busybox', command: 'ls', args: ['-l']}
     * @param {K8sClient} k8sClient - K8sClient to use.
     * @param {Object} logger - Logger object.
     */
    constructor(options, k8sClient, logger) {
        super();

        if (!validString(options.name) || !validString(options.schedule) || !validString(options.image) || !validString(options.command)) {
            throw new Error(`A cron job requires a name, schedule, image and command`);
        }

        this._options = options;
        this._logger = logger;
        this._k8sClient = k8sClient;
        this._obj = null;
    }

    /**
     * Execute the command.
     */
    async execute() {
        try {

            const alreadyExists = await this._k8sClient.exists('cronjob', this._options.name, this._options.namespace);
            if (!alreadyExists) {
                this._obj = await this._k8sClient.create(`
                    apiVersion: "batch/v1"
                    kind: "CronJob"
                    metadata:
                        name: "${this._options.name}"
                        namespace: "${this._options.namespace || "default"}"
                    spec:
                        schedule: "${this._options.schedule}"
                        jobTemplate:
                            spec:
                                template:
                                    spec:
                                        containers:
                                            - name: "${process.env.HELM_RELEASE_NAME}-data-collector"
                                              image: "${this._options.image}"
                                              command: ["${this._options.command}"]
                                              args: ${JSON.stringify(this._options.args)}
                                              envFrom:
                                              - secretRef:
                                                  name: "${process.env.HELM_RELEASE_NAME}-deep-microservice-collection-secret"
                                              ${ process.env.PREDECOS_KAFKA_SECRET ? `
                                              - secretRef:
                                                  name: "${process.env.PREDECOS_KAFKA_SECRET}"
                                              ` : ``}
                                        serviceAccountName: "${process.env.HELM_RELEASE_NAME}-secret-accessor-service-account"
                                        restartPolicy: "Never"
                                        imagePullSecrets:
                                            - name: "docker-secret"
                `);

                this._logger.debug(`Created cron job:\n\n${stringify(this._obj)}`);
            } else {
                this._obj = await this._k8sClient.get('cronjob', this._options.name, this._options.namespace);

                this._logger.debug(`Fetched cron job:\n\n${stringify(this._obj)}`);
            }
        } catch (e) {
            this._logger.error(`An error occurred while creating cron job: ${e.message.toString()}\n\n${JSON.stringify(e)}\n\n${e.stack}`);
        }
    }

    /**
     * Stop the command.
     */
    async stop() {

        if (!this._obj) return;

        try {

            this._logger.info(`Deleting cron job.\n\n${stringify(this._obj)}`);
            await this._k8sClient.delete(this._obj);
        } catch (e) {

            this._logger.error(`An error occurred while deleting cron job: ${e.message.toString()}\n\n${JSON.stringify(e)}\n\n${e.stack}`);
        }
    }
}

export { K8sCronJob };