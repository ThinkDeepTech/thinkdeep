/**
 * Base class for operation instances.
 */
class Operation {
  /**
   * Check if the operation is in a valid state.
   */
  get valid() {
    throw new Error(`This hasn't been implemented yet.`);
  }

  /**
   * Get the container image to use.
   */
  get image() {
    throw new Error(`This hasn't been implemented yet.`);
  }

  /**
   * Get the commands to execute
   */
  get commands() {
    throw new Error(`This hasn't been implemented yet.`);
  }

  /**
   * Get the arguments to pass into the commands.
   */
  get args() {
    throw new Error(`This hasn't been implemented yet.`);
  }
}

export {Operation};
