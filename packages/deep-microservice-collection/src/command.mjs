
class Command {

    /**
     * @param {Number} waitTime - Time to wait in between callback calls.
     * @param {Function} callback - Function to be executed.
     */
    constructor(waitTime, callback) {
        this._waitTime = waitTime;
        this._callback = callback;
        this._intervalId= null;
    }

    /**
     * Execute the command.
     *
     * NOTE: This will run setInterval on the callback with the wait time.
     */
    execute() {
        this._callback();
        this._intervalId = setInterval(this._callback, this._waitTime);
    }

    /**
     * Stop the command.
     */
    stop() {
        clearInterval(this._intervalId);
    }
}

export { Command };