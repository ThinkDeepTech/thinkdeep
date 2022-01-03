
class Command {
    constructor(interval, callback) {
        this._interval = interval;
        this._callback = callback;
        this._intervalId= null;
    }

    execute() {
        this._intervalId = setInterval(this._callback, this._interval);
    }
}

export { Command };