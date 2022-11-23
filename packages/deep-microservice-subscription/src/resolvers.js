import {EconomicEntityFactory} from '@thinkdeep/model';
import {KafkaPubSub} from '@thinkdeep/graphql-kafka-subscriptions';
import {withFilter} from 'graphql-subscriptions';
import {hasReadAllAccess} from './permissions.js';

const pubsub = new KafkaPubSub({
  topic: 'SENTIMENT_COMPUTED',
  host: `${process.env.PREDECOS_KAFKA_HOST}`,
  port: `${process.env.PREDECOS_KAFKA_PORT}`,
  globalConfig: {}, // options passed directly to the consumer and producer
});

const resolvers = {
  Subscription: {
    updateSentiments: {
      resolve: async (payload, _, {permissions}, __) => {
        if (
          !hasReadAllAccess(permissions) ||
          Object.keys(payload.data || {}).length <= 0
        ) {
          return {};
        } else {
          return payload.data;
        }
      },
      subscribe: withFilter(
        () => pubsub.asyncIterator([`SENTIMENT_COMPUTED`]),
        (payload, variables) => {
          if (variables.endDate) {
            return false;
          }

          for (const economicEntity of EconomicEntityFactory.get(
            variables.economicEntities
          )) {
            if (
              economicEntity.equals(
                EconomicEntityFactory.get(payload.economicEntity)
              )
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
