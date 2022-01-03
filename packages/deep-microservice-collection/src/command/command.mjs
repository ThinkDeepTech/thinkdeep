
class Command {
    constructor(interval, callback) {
        this._interval = interval;
        this._callback = callback;
    }

    execute() {
        setInterval(this._callback, this._interval);
    }
}

export { Command };