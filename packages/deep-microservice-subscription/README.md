# Purpose

[![Vulnerabilities](https://snyk.io/test/github/ThinkDeepTech/thinkdeep/master/badge.svg?targetFile=packages/deep-microservice-subscription/package.json)](https://snyk.io/test/github/ThinkDeepTech/thinkdeep/master?targetFile=packages/deep-microservice-subscription/package.json)

The subscription microservice is responsible for maintaining a connection with the
front-end so that the UI can respond to back-end events immediately. This allows for real-time data
monitoring which is not currently heavily used but will be soon.

## Developer Setup (Ubuntu)
- Add the following environment variables:
    1. PREDECOS_AUTH_JWKS_URI : Auth0 JWKS Uri
    1. PREDECOS_AUTH_AUDIENCE : Auth0 audience
    1. PREDECOS_AUTH_ISSUER : Auth0 Issuer
    1. PREDECOS_MICROSERVICE_ANALYSIS_URL : Url to analysis microservice.
    1. PREDECOS_MICROSERVICE_COLLECTION_URL : Url to collection microservice.
    1. PREDECOS_MICROSERVICE_CONFIGURATION_URL : Url to the configuration microservice.
    1. PREDECOS_KAFKA_HOST : Host at which the Kafka cluster can be accessed.
    1. PREDECOS_KAFKA_PORT : Port at which the Kafka cluster can be accessed.
    1. NODE_ENV : The node environment (i.e, development, production).
