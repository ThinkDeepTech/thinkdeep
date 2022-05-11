import {Operation} from './operation.js';

/**
 * Operation to execute against the data collector CLI.
 */
class DataCollector extends Operation {
  /**
   * @param {String} entityName Name of the economic entity (i.e, Google).
   * @param {String} entityType Type of the economic entity (i.e, BUSINESS).
   * @param {String} operationType Specific operation to execute (i.e, fetch-tweets).
   * @param {String} [imageName = process.env.DATA_COLLECTOR_IMAGE_NAME] Name of the image on which operation will execute.
   */
  constructor(
    entityName,
    entityType,
    operationType,
    imageName = process.env.DATA_COLLECTOR_IMAGE_NAME
  ) {
    super();

    this._imageName = imageName;
    this._entityName = entityName;
    this._entityType = entityType;
    this._operationType = operationType;
  }

  /**
   * Check if the operation is in a valid state.
   */
  get valid() {
    const image = this.image;
    const commands = this.commands;
    const args = this.args;

    return (
      !!image &&
      Array.isArray(commands) &&
      commands.length > 0 &&
      Array.isArray(args) &&
      args.length > 0
    );
  }

  /**
   * Get the operation image.
   */
  get image() {
    return this._imageName;
  }

  /**
   * Get operation commands.
   */
  get commands() {
    return ['node'];
  }

  /**
   * Get operation arguments.
   */
  get args() {
    return [
      'src/data-collector.js',
      `--entity-name=${this._entityName}`,
      `--entity-type=${this._entityType}`,
      `--operation-type=${this._operationType}`,
    ];
  }
}

export {DataCollector};
