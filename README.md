# Thinkdeep (Predecos)
[![CircleCI](https://circleci.com/gh/ThinkDeepTech/thinkdeep.svg?style=shield)](https://circleci.com/gh/ThinkDeepTech/thinkdeep)
[![Quality Gate Status](https://sonarcloud.io/api/project_badges/measure?project=ThinkDeepTech_thinkdeep&metric=alert_status)](https://sonarcloud.io/summary/new_code?id=ThinkDeepTech_thinkdeep)
[![Security Rating](https://sonarcloud.io/api/project_badges/measure?project=ThinkDeepTech_thinkdeep&metric=security_rating)](https://sonarcloud.io/summary/new_code?id=ThinkDeepTech_thinkdeep)
[![Coverage Status](https://coveralls.io/repos/github/ThinkDeepTech/thinkdeep/badge.svg?branch=master)](https://coveralls.io/github/ThinkDeepTech/thinkdeep?branch=master)
[![Maintainability](https://api.codeclimate.com/v1/badges/a9eb1d6f95a73bfda23d/maintainability)](https://codeclimate.com/github/ThinkDeepTech/thinkdeep/maintainability)
[<img src="https://i.stack.imgur.com/gVE0j.png" height="20" width="20">](https://www.linkedin.com/in/haydenmcp/)
[<img src="https://i.stack.imgur.com/tskMh.png" height="20" width="20">](https://github.com/haydenmcp)


**Economic Analyzer** [![Economic Analyzer Vulnerabilities](https://snyk.io/test/github/ThinkDeepTech/thinkdeep/master/badge.svg?targetFile=packages/deep-economic-analyzer/package.json)](https://snyk.io/test/github/ThinkDeepTech/thinkdeep/master?targetFile=packages/deep-economic-analyzer/package.json)

**Collection Microservice** [![Collection Microservice Vulnerabilities](https://snyk.io/test/github/ThinkDeepTech/thinkdeep/master/badge.svg?targetFile=packages/deep-microservice-collection/package.json)](https://snyk.io/test/github/ThinkDeepTech/thinkdeep/master?targetFile=packages/deep-microservice-collection/package.json)

**Subscription Microservice** [![Subscription Microservice Vulnerabilities](https://snyk.io/test/github/ThinkDeepTech/thinkdeep/master/badge.svg?targetFile=packages/deep-microservice-subscription/package.json)](https://snyk.io/test/github/ThinkDeepTech/thinkdeep/master?targetFile=packages/deep-microservice-subscription/package.json)

**Data Collector** [![Data Collector Vulnerabilities](https://snyk.io/test/github/ThinkDeepTech/thinkdeep/master/badge.svg?targetFile=packages/data-collector/package.json)](https://snyk.io/test/github/ThinkDeepTech/thinkdeep/master?targetFile=packages/data-collector/package.json)


The purpose of this repository is to build a full-stack analytics platform for economic data. It's also to develop something cool and to learn.

## Global Dependencies
- [Node v16.14.2](https://nodejs.org/en/)
- [Lerna v5.0.0](https://github.com/lerna/lerna)
- [Snyk CLI v1.936.0](https://github.com/snyk/cli)
- [Yarn v2](https://yarnpkg.com/)
- [Kubectl v1.22.0](https://kubernetes.io/docs/tasks/tools/)
- [Helm v3.8.2](https://helm.sh/)

## Developer Setup

NOTE: DigitalOcean certificates are required to apply TLS to the loadbalancers. Therefore, securely deploying this
application requires deployment to a DigitalOcean kubernetes cluster at this time.

- Run
```console

    yarn install

```
- Run helm install in project root and set required values.
- Set the following environment variables:
    - PREDECOS_AUTH_DOMAIN
    - PREDECOS_AUTH_CLIENT_ID
    - PREDECOS_AUTH_AUDIENCE
    - PREDECOS_AUTH_JWKS_URI
    - PREDECOS_AUTH_ISSUER
    - PREDECOS_TEST_AUTH_DOMAIN
    - PREDECOS_TEST_AUTH_CLIENT_ID
    - PREDECOS_TEST_AUTH_AUDIENCE
    - PREDECOS_TEST_AUTH_JWKS_URI
    - PREDECOS_TEST_AUTH_ISSUER
    - PREDECOS_TEST_AUTH_USERNAME
    - PREDECOS_TEST_AUTH_PASSWORD
    - PREDECOS_TEST_AUTH_SCOPE
    - PREDECOS_TEST_AUTH_CLIENT_SECRET
    - PREDECOS_TEST_MICROSERVICE_GATEWAY_URL
    - PREDECOS_TEST_MICROSERVICE_SUBSCRIPTION_URL
    - PREDECOS_MICROSERVICE_GATEWAY_URL
    - PREDECOS_MICROSERVICE_SUBSCRIPTION_URL
- Open terminal and navigate to <project root>/packages/deep-economic-analyzer
- Run
```console
    yarn run start
```

## Goals
The goal started out as creation of a LitElement component collection usable in multiple web application templates. Those
templates can be used to quickly assemble web applications for potential customers. This goal has extended
into application development that can be used to analyze business relationships for investing purposes; a concrete
implementation of that template idea.

## Design Decisions

![High Level Architecture](./img/predecos-high-level.png "High Level Architecture")

### The Front-end

#### Lit
[Lit](https://lit.dev) has multiple benefits. First, it's familiar to me, which is significant. However, It's also incredibly fast and light-weight. When benchmarked against React, it [performs quite a bit better](https://javascript.plainenglish.io/javascript-frameworks-performance-comparison-2020-cd881ac21fce). Lit came about as a result of the desire to use the browsers support for the web components standard to create framework agnostic components. Frameworks such as React and Angular are essentially needed because the browser doesn't perform its job well enough. It's ideal to move the custom component concept into the browser itself instead of relying on a framework for that functionality because frameworks introduce additional layers which increase execution time and likelihood of dependency conflict. They prevent reuse of custom components from one framework to the next making it difficult to migrate to a different framework as well as requiring recreation of components that may already be available to another framework. With [increasing web components support](https://developer.mozilla.org/en-US/docs/Web/Web_Components) in numerous popular browsers such as Chrome, Firefox and Safari those frameworks are soon to be obsolete despite the fact that they are still extremely popular.

#### Rollup
Building the application is done using rollup because it has a clean, concise syntax. WebPack is extremely customizable, but more confusing to maintain.

#### Testing
Mocha and chai are used for front-end testing along with [open-wc testing helpers](https://open-wc.org/docs/testing/helpers/) and
[web test runner](https://modern-web.dev/docs/test-runner/overview/).


### The Back-end / Operations

#### Microservices Architecture
The microservices architecture provides for scalability of the system as well as clean separation of concerns. The goal of this
application is to create a data analysis platform. There are three typical processes involved in a data processing pipeline;
data collection, data cleaning and data analysis. The microservices are partitioned by those responsibilities along with various
site-specific bits of functionality (i.e, configuration). In combination with kubernetes and docker, this means that each microservice
can scale independently of the other microservices. Additionally, each can be deployed independtly and if one fails the result won't
necessarily bring down the whole system. Kafka is used for communication between the different microservices which is efficient.
An event occurs and microservices that subscribe to that event process it.
This in combination with graphql subscriptions allows for the user-interface to be updated every time an event occurs.

#### Kafka
[Bitnami Kafka](https://github.com/bitnami/bitnami-docker-kafka) is used which is a helm chart carrying [Apache Kafka](https://kafka.apache.org/). Kafka is a messaging system that's heavily used for event handling.It's been around for a while and is battle-tested. It's not the fastest option out there, but events persist and the interface is simple when used with [KafkaJS](https://kafka.js.org/). Production-readiness is obvious given its use by many large companies. Using Kafka enables powerful real-time capabilities for the application such as subscriptions, and fast, easy microservice communication.

#### Apollo GraphQL
[Apollo GraphQL](https://www.apollographql.com/) provides a production-ready GraphQL implementation. For a microservices architecture, the goal is to create isolated units that have a single responsibility and that can scale independently. I've used Apollo federation because it's viewed as a better way of isolating microservice responsibilities. Specifically, a microservice defines its own types but it also defines how its interface is used by other microservices. This, in theory, encapsulates all of the code relating to a given service in one codebase. One resulting benefit is development can be done without making changes that collide with other teams' changes provided that the interface is agreed upon. Federation provides mechanisms for connecting a subgraph to a full application supergraph in a seamless way. It uses a single gateway that provides access to the remaining services. This gateway is the publicly accessible end-point for the microservices and routes requests to the necessary microservices needed to gather the response. This concept is used because it's intended to introduce additional microservices that will perform tasks such as data fetching/collection, data cleaning and data analysis. Additional benefits include reducing the number of requests that need to go over the wire to gather data when compared to RESTful APIs. It's backed by facebook and is used by numerous companies and is therefore battle-tested.

#### Kubernetes
[Kubernetes](https://kubernetes.io/) is a container orchestration system with many powerful characteristics. It's used in this
project to take advantage of self-healing, monitoring, replication and load-balancing.

#### Helm
[Helm](https://helm.sh/) integrates quite well with Kubernetes. Management of Kubernetes manifests becomes difficult as multiple deployments become necessary because a new set of manifests need to be created for each environment (i.e., development, production). Helm solves this issue by allowing Kubernetes manifest templates to be created so that concrete manifests can be generated based on desired configurations. In my case, this has allowed one-click manual deployment of all the microservices regardless of the environment. It also allows simple configuration of certificates if TLS is desired. Based on Kubernetes service hostname defaults each deployment can be wired up to the necessary services used, making the manual deployment process extremely easy. Uninstalling is equally straightforward. Helm also provides easy version management.

#### Docker
Docker provides image creation and is used for a couple of reasons. It allows developers to reproduce bugs that are seen in different environments, such as production. It encapsulates application dependencies and configuration such that each application will run without concern about conflicts. It allows for easy backup and it takes up a much smaller footprint than virtual machines. It's also moving toward greater adoption on multiple platforms such as windows.

#### MongoDB
While data structure is unknown MongoDB is a good fit because it allows for creation of data in a flexible manner. While data structure
is being figured out Mongo can be used to quickly store data of a particular structure mapping easily to the graphql API. Joins are much
slower on Mongo when compared to RDBMS so there are performance implications. However, the current data landscape is very simple. Once
complexity is introduced through use cases, Postgres will be adopted where appropriate (i.e, data analysis).

#### Testing
Mocha and chai are also used in the back-end. The 'expect' syntax is incredibly readable and easy to understand.
It's also desirable to use as few technologies as possible to achieve one's goals because that makes it easier for developers to
learn, which means it's easier to navigate the codebase.

### Additional Design Decisions

#### Continuous deployment
The system is automatically deployed to my public development environment. This is a powerful concept that allows for
fast development. With sufficient testing the automated system safely deploys the code to the public environment.

#### Use of full-stack JavaScript
Reducing the mental effort needed to understand a given codebase has dramatic impacts on software development speed
and stability. Full-stack javascript was used here (along with the same testing frameworks on both front and back end)
because developers only have to learn one language as opposed to multiple. If the need arises, a microservice can diverge
from that due to the isolation of the microservices. However, it's ideal to keep everything simple.

#### Auth0 for Authentication/Authorization
Regardless of a developers experience-level implementing security-related code it's a good idea to use a library that's
trusted by many others and that's open-source. Popular open-source security libraries have the advantage that more eyes can see the code
thereby increasing the likelihood that vulnerabilities will be found. Additionally, when they're found they can be fixed by
one developer that's good at security and that fix will benefit everyone using the library. Due to my lack of experience
with security-related development I opted to use one that was already available. Auth0.
