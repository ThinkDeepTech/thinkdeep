# Purpose
The analysis microservice is responsible for all data analysis operations. After data collection occurs, it's routed to analysis
where various algorithms will process that data and store the results to display for the user. Currently, there are no analytics
but that's soon to come.

## Developer Setup (Ubuntu)
```console
    yarn install
```
- Add the following environment variables:
    1. PREDECOS_KAFKA_HOST : Host providing access to the cluster brokers.
    1. PREDECOS_KAFKA_PORT : Port at which kafka can be accessed.
    1. PREDECOS_MONGODB_CONNECTION_STRING : Connection string for MongoDB.
    1. NODE_ENV : The node environment (i.e, development, production).