import {KafkaPubSub} from '@thinkdeep/graphql-kafka-subscriptions';
import {withFilter} from 'graphql-subscriptions';
import {hasReadAllAccess} from './permissions.js';

const pubsub = new KafkaPubSub({
  topic: 'TWEET_SENTIMENT_COMPUTED',
  host: `${process.env.PREDECOS_KAFKA_HOST}`,
  port: `${process.env.PREDECOS_KAFKA_PORT}`,
  globalConfig: {}, // options passed directly to the consumer and producer
});

const identicalEconomicEntity = (economicEntity1, economicEntity2) => {
  return (
    !!economicEntity1.name &&
    !!economicEntity1.type &&
    economicEntity1.name === economicEntity2.name &&
    economicEntity1.type === economicEntity2.type
  );
};

const resolvers = {
  Subscription: {
    updateSentiments: {
      resolve: async (payload, _, {permissions}, __) => {
        if (
          !hasReadAllAccess(permissions) ||
          Object.keys(payload.data).length <= 0
        ) {
          return {};
        } else {
          return payload.data;
        }
      },
      subscribe: withFilter(
        () => pubsub.asyncIterator([`TWEET_SENTIMENT_COMPUTED`]),
        (payload, variables) => {
          for (const economicEntity of variables.economicEntities) {
            if (
              identicalEconomicEntity(economicEntity, payload.economicEntity)
            ) {
              return true;
            }
          }

          return false;
        }
      ),
    },
  },
};

export {resolvers};
