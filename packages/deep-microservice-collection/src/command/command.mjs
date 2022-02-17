
class Command {

    /**
     * Execute the command.
     */
    execute() {
        throw new Error(`The function execute() of class Command is abstract and requires concrete implementation.`);
    }

    /**
     * Stop the command.
     */
    stop() {
        throw new Error(`The function stop() of class Command is abstract and requires concrete implementation.`);
    }
}

export { Command };