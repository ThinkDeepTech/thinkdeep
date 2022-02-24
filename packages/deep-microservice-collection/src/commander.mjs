
import { validString } from './helpers.mjs';

class Commander {

    constructor(logger) {
        this._commandMap = {};
        this._logger = logger;
    }

    /**
     * Execute the commands and associate them with the key provided.
     * @param {String} key - The key to associate with the commands.
     * @param {Array} commands - Command objects to execute.
     * @throws {Error} Will throw an error if the key is not a valid string.
     */
    async execute(key, commands) {

        if (!validString(key)) throw new Error(`Key must be a valid string. Received: ${key}`);

        if (!Array.isArray(commands)) return;

        this._addCommands(key, commands);

        this._logger.info(`Executing commands for key ${key}`);
        for (const command of this._commands(key)) {
            await command.execute();
        }
    }

    /**
     * Stop all the running commands.
     */
    async stopAllCommands() {

        for (const [key, commands] of Object.entries(this._commandMap)) {

            this._logger.info(`Clearing commands for key ${key}, ${JSON.stringify(commands)}`);
            await this._stopCommands(commands);
        }
    }

    /**
     * Stop the passed commands.
     * @param {Array} commands - Command objects.
     * @returns
     */
    async _stopCommands(commands) {

        if (!Array.isArray(commands)) return;

        for (const command of commands) {
            this._logger.info(`Stopping command ${JSON.stringify(command)}`);
            await command.stop();
        }
    }

    /**
     * Track the specified commands with the key provided.
     * @param {String} key - Key to be used.
     * @param {Array} commands - Command objects.
     * @returns
     */
    _addCommands(key, commands) {

        if (!validString(key)) throw new Error(`Key must be valid but was not. Received: ${key}`);

        if (!Array.isArray(commands)) return;

        this._logger.info(`Adding commands for key ${key}`);

        this._commandMap[key] = commands;
    }

    /**
     * Fetch the commands associated with the provided key.
     * @param {String} key
     * @returns {Array} Command objects.
     */
    _commands(key) {

        if (!validString(key)) throw new Error(`Key must be valid but was not. Received: ${key}`);

        return this._commandMap[key];
    }
}

export { Commander };