
import { KafkaPubSub } from 'graphql-kafka-subscriptions';
import { withFilter } from 'graphql-subscriptions';

// TODO: Replace with env vars
const pubsub = new KafkaPubSub({
    topic: `TWEET_SENTIMENT_COMPUTED`,
    host: 'localhost',
    port: '9092',
    globalConfig: {} // options passed directly to the consumer and producer
});

const resolvers = {
    Subscription: {
        updateSentiments: {
            resolve(payload, args, _, __) {
                return payload.sentiments;
            },
            subscribe: withFilter(() => pubsub.asyncIterator([`TWEET_SENTIMENT_COMPUTED`]), (payload, variables) => {
                return (payload.economicEntityName === variables.economicEntityName) && (payload.economicEntityType === variables.economicEntityType);
            })
        }
    }
};

export { resolvers };