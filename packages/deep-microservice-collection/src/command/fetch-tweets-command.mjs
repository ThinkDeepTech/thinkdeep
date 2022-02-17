import "./command.mjs"
import "../cron-job.mjs"

/**
 * Time interval between each twitter API call.
 *
 * NOTE: Due to twitter developer account limitations only 500,000 tweets can be consumed per month.
 * As a result, ~400 businesses can be watched.
 */
const TWITTER_FETCH_INTERVAL = 6 * 60 * 60 * 1000; /** hrs * min * seconds * ms */

class FetchTweetsCommand extends Command {

    constructor(economicEntityName, economicEntityType) {
        super();

        this._economicEntityName = economicEntityName;
        this._economicEntityType = economicEntityType;

        this._cronJob = new CronJob({
            // TODO: Translate TWITTER_FETCH_INTERVAL into schedule
            schedule: `* * * * *`,
            command: 'node',
            args: `--economicEntityName=${economicEntityName} --economicEntityType=${economicEntityType} fetch-tweets.mjs`
        });
    }

    execute() {
        this._cronJob.execute();
    }

    stop() {
        this._cronJob.stop();
    }
}

export { FetchTweetsCommand };