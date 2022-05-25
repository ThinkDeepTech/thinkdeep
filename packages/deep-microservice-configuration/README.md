# Purpose

[![Vulnerabilities](https://snyk.io/test/github/ThinkDeepTech/thinkdeep/master/badge.svg?targetFile=packages/deep-microservice-configuration/package.json)](https://snyk.io/test/github/ThinkDeepTech/thinkdeep/master?targetFile=packages/deep-microservice-configuration/package.json)

The configuration microservice is responsible for managing user configuration. This application
doesn't include an auth microservice; a third-party tool is used for that. However, user
configuration such as what businesses to watch, etc, still needs to be stored and tied
to that particular user in a secure, private manner. The ID Token and Access Token are used for
this purpose.

## Environment variables
- PREDECOS_MONGODB_CONNECTION_STRING : MongoDB connection string.
