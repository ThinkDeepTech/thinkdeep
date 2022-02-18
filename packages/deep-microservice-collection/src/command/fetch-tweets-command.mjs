import "./command.mjs"
import "../k8s/cron-job.mjs"

/**
 * Time interval between each twitter API call.
 *
 * NOTE: Due to twitter developer account limitations only 500,000 tweets can be consumed per month.
 * As a result, ~400 businesses can be watched.
 */
// const TWITTER_FETCH_INTERVAL = 6 * 60 * 60 * 1000; /** hrs * min * seconds * ms */

class FetchTweetsCommand extends Command {

    constructor(economicEntityName, economicEntityType) {
        super();

        this._economicEntityName = economicEntityName;
        this._economicEntityType = economicEntityType;

        this._cronJob = new CronJob({
            name: `fetch-tweets-${economicEntityName.toLowerCase()}-${economicEntityType.toLowerCase()}`,
            namespace: 'default',
             // TODO: Translate TWITTER_FETCH_INTERVAL into schedule
             /** min | hour | day | month | weekday */
            schedule: `0 6 * * *`,
            // TODO:
            // image: 'thinkdeeptech/collect-data:latest',
            image: 'busybox:latest',
            command: 'sleep',
            args: ['10']
            // command: 'node',
            // args: ['collect-data.mjs', `--entity-name=${economicEntityName}`, `--entity-type=${economicEntityType}`, '--operation-type=fetch-tweets']
        });
    }

    async execute() {
        await this._cronJob.execute();
    }

    async stop() {
        await this._cronJob.stop();
    }
}

export { FetchTweetsCommand };