# Purpose
Data collection drives this microservice. It's responsible for spinning up processes that do data collection,
trigger kafka events at which point it stores the data in MongoDB.

## Environment Variables
1. PREDECOS_MONGODB_CONNECTION_STRING : MongoDB connection string.
1. PREDECOS_KAFKA_HOST : Host at which Kafka can be accessed.
1. PREDECOS_KAFKA_PORT : Port at which Kafka can be accessed.
1. PREDECOS_TWITTER_BEARER : Twitter API bearer token allowing collection of tweets.
1. NODE_ENV : The node environment (i.e, development, production).