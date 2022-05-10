/**
 * Base class for commands executed by the commander.
 */
class Command {
  /**
   * Execute the command.
   */
  async execute() {
    throw new Error(
      `The function execute() of class Command is abstract and requires concrete implementation.`
    );
  }

  /**
   * Stop the command.
   */
  async stop() {
    throw new Error(
      `The function stop() of class Command is abstract and requires concrete implementation.`
    );
  }
}

export {Command};
