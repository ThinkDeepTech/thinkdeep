
import { KafkaPubSub } from 'graphql-kafka-subscriptions';

// TODO: Replace with env vars
const pubsub = new KafkaPubSub({
    topic: 'TWEET_SENTIMENT_COMPUTED',
    host: 'localhost',
    port: '9092',
    globalConfig: {} // options passed directly to the consumer and producer
});

const resolvers = {
    Subscription: {
        updateSentiments: {
            resolve(payload, args, _, __) {
                debugger;
                return payload.sentiments;
            },
            subscribe(_, __) {
                return pubsub.asyncIterator(['TWEET_SENTIMENT_COMPUTED']);
            }
        }
    }
};

export { resolvers };