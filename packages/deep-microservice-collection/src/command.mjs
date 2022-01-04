
class Command {
    constructor(waitTime, callback) {
        this._waitTime = waitTime;
        this._callback = callback;
        this._intervalId= null;
    }

    execute() {
        this._intervalId = setInterval(this._callback, this._waitTime);
    }

    stop() {
        clearInterval(this._intervalId);
    }
}

export { Command };