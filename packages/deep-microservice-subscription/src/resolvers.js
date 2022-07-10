import {KafkaPubSub} from '@thinkdeep/graphql-kafka-subscriptions';
import {withFilter} from 'graphql-subscriptions';
import {hasReadAllAccess} from './permissions.js';

const pubsub = new KafkaPubSub({
  topic: 'TWEET_SENTIMENT_COMPUTED',
  host: `${process.env.PREDECOS_KAFKA_HOST}`,
  port: `${process.env.PREDECOS_KAFKA_PORT}`,
  globalConfig: {}, // options passed directly to the consumer and producer
});

const resolvers = {
  Subscription: {
    updateSentiments: {
      resolve: async (payload, _, {permissions}, __) => {
        if (!hasReadAllAccess(permissions)) {
          return [];
        } else {
          return payload;
        }
      },
      subscribe: withFilter(
        () => pubsub.asyncIterator([`TWEET_SENTIMENT_COMPUTED`]),
        (payload, variables) => {
          return (
            payload.economicEntityName === variables.economicEntityName &&
            payload.economicEntityType === variables.economicEntityType
          );
        }
      ),
    },
  },
};

export {resolvers};
