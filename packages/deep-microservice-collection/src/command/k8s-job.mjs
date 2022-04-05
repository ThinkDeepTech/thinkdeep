import {Command} from './command.mjs';
import {validString} from '../helpers.mjs';
import {K8sClient, stringify} from '@thinkdeep/k8s';

class K8sJob extends Command {
    /**
     * Constructs a kubernetes job with the specified configuration.
     *
     * @param {Object} options - Options desired for job of the form: { name: 'job-name', image: 'busybox', command: 'ls', args: ['-l']}
     * @param {K8sClient} k8sClient - K8sClient to use.
     * @param {Object} logger - Logger object.
     */
     constructor(options, k8sClient, logger) {
        super();

        if (!validString(options.name) || !validString(options.image) || !validString(options.command)) {
            throw new Error(`A job requires a name, image and command`);
        }

        this._logger = logger;
        this._k8sClient = k8sClient;
        this._obj = null;
    }

    async execute() {
        try {
                this._logger.info(`Creating job.`);
                this._obj = await this._k8sClient.create(`
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
                                      command: ["${options.command}"]
                                      args: ${JSON.stringify(options.args)}
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

                this._logger.debug(`Created job:\n\n${stringify(this._obj)}`);
        } catch (e) {
            this._logger.error(`An error occurred while creating job: ${e.message.toString()}`);
        }
    }

    async stop() {
        try {
            this._logger.info(`Deleting job.`);
            await this._k8sClient.delete(this._obj);
        } catch (e) {
            this._logger.error(`An error occurred while deleting job: ${e.message.toString()}`);
        }
    }
}

export { K8sJob };