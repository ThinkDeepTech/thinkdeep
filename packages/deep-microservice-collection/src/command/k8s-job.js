import {Command} from './command.js';
import {validString} from '@thinkdeep/util';
import {stringify} from '@thinkdeep/k8s';

/**
 * Command executing a kubernetes job.
 */
class K8sJob extends Command {
  /**
   * Constructs a kubernetes job with the specified configuration.
   *
   * @param {Object} options - Options desired for job of the form: { name: 'job-name', operation: <Concrete operation impl>}
   * @param {K8sClient} k8sClient - K8sClient to use.
   * @param {Object} logger - Logger object.
   */
  constructor(options, k8sClient, logger) {
    super();

    if (!validString(options.name) || !options?.operation?.valid) {
      throw new Error(
        `A job requires a name and a valid operation to perform.`
      );
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
      this._obj = await this._k8sClient.create(`
                    apiVersion: "batch/v1"
                    kind: "Job"
                    metadata:
                        name: "${this._options.name}"
                        namespace: "${this._options.namespace || 'default'}"
                    spec:
                        template:
                            spec:
                                containers:
                                    - name: "${
                                      process.env.HELM_RELEASE_NAME
                                    }-data-collector"
                                      image: "${this._options.operation.image}"
                                      command: ${JSON.stringify(
                                        this._options.operation.commands
                                      )}
                                      args: ${JSON.stringify(
                                        this._options.operation.args
                                      )}
                                      envFrom:
                                      - secretRef:
                                          name: "${
                                            process.env.HELM_RELEASE_NAME
                                          }-deep-microservice-collection-secret"
                                      ${
                                        process.env.PREDECOS_KAFKA_SECRET
                                          ? `
                                      - secretRef:
                                          name: "${process.env.PREDECOS_KAFKA_SECRET}"
                                      `
                                          : ``
                                      }
                                serviceAccountName: "${
                                  process.env.HELM_RELEASE_NAME
                                }-secret-accessor-service-account"
                                restartPolicy: "Never"
                                imagePullSecrets:
                                    - name: "docker-secret"
                `);

      this._logger.debug(`Created job:\n\n${stringify(this._obj)}`);
    } catch (e) {
      this._logger.error(
        `An error occurred while creating job: ${e.message.toString()}\n\n${JSON.stringify(
          e
        )}`
      );
    }
  }

  /**
   * Stop the command.
   */
  async stop() {
    if (!this._obj) return;

    try {
      this._logger.info(`Deleting job.`);
      await this._k8sClient.delete(this._obj);
    } catch (e) {
      this._logger.error(
        `An error occurred while deleting job: ${e.message.toString()}\n\n${JSON.stringify(
          e
        )}`
      );
    }
  }
}

export {K8sJob};
