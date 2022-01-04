
import { validString } from './helpers.mjs';

class Commander {

    constructor(logger) {
        this._commandMap = {};
        this._logger = logger;
    }

    execute(key, commands) {

        if (!validString(key)) throw new Error(`Key must be a valid string. Received: ${key}`);

        if (!Array.isArray(commands)) return;

        this._addCommands(key, commands);

        this._logger.info(`Executing commands for key ${key}`);
        for (const command of this._commands(key)) {
            command.execute();
        }
    }

    stopAllCommands() {

        for (const [key, commands] of Object.entries(this._commandMap)) {

            this._logger.info(`Clearing commands for key ${key}`);
            this._stopCommands(commands);
        }
    }

    _stopCommands(commands) {

        if (!Array.isArray(commands)) return;

        for (const command of commands) {
            command.stop();
        }
    }

    _addCommands(key, commands) {

        if (!validString(key)) throw new Error(`Key must be valid but was not. Received: ${key}`);

        if (!Array.isArray(commands)) return;

        this._logger.info(`Adding commands for key ${key}`);

        this._commandMap[key] = commands;
    }

    _commands(key) {

        if (!validString(key)) throw new Error(`Key must be valid but was not. Received: ${key}`);

        return this._commandMap[key];
    }
}

export { Commander };