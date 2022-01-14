
import { KafkaPubSub } from 'graphql-kafka-subscriptions';

const resolvers = {
    Subscription: {
        updateSentiments: {
            resolve(payload, args, _, __) {
                return payload.sentiments;
            },
            subscribe(_, {economicEntityName, economicEntityType}) {
                // TODO: Replace with env vars
                const pubsub = new KafkaPubSub({
                    topic: `TWEET_SENTIMENT_COMPUTED_${economicEntityName}_${economicEntityType}`,
                    host: 'localhost',
                    port: '9092',
                    globalConfig: {} // options passed directly to the consumer and producer
                });
                return pubsub.asyncIterator([`TWEET_SENTIMENT_COMPUTED_${economicEntityName}_${economicEntityType}`]);
            }
        }
    }
};

export { resolvers };