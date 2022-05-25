# Purpose

[![Vulnerabilities](https://snyk.io/test/github/ThinkDeepTech/thinkdeep/master/badge.svg?targetFile=packages/deep-microservice-gateway/package.json)](https://snyk.io/test/github/ThinkDeepTech/thinkdeep/master?targetFile=packages/deep-microservice-gateway/package.json)

The gateway microservice provides a public access point into the application back-end. It "stiches" together
the subgraph microservices in a way that allows the front-end to send queries that involve multiple back-end
microservices. Only one end-point is required for the queries (or mutations).


## Developer Setup (Ubuntu)
- Add the following environment variables:
    1. PREDECOS_AUTH_JWKS_URI : Auth0 JWKS Uri
    1. PREDECOS_AUTH_AUDIENCE : Auth0 audience
    1. PREDECOS_AUTH_ISSUER : Auth0 Issuer
    1. PREDECOS_MICROSERVICE_ANALYSIS_URL : Url to analysis microservice.
    1. PREDECOS_MICROSERVICE_COLLECTION_URL : Url to collection microservice.
    1. PREDECOS_MICROSERVICE_CONFIGURATION_URL : Url to the configuration microservice.
    1. NODE_ENV : The node environment (i.e, development, production).
