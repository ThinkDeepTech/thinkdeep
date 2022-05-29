# Thinkdeep
[![CircleCI](https://circleci.com/gh/ThinkDeepTech/thinkdeep.svg?style=shield)](https://circleci.com/gh/ThinkDeepTech/thinkdeep)
[![Quality Gate Status](https://sonarcloud.io/api/project_badges/measure?project=ThinkDeepTech_thinkdeep&metric=alert_status)](https://sonarcloud.io/summary/new_code?id=ThinkDeepTech_thinkdeep)
[![Security Rating](https://sonarcloud.io/api/project_badges/measure?project=ThinkDeepTech_thinkdeep&metric=security_rating)](https://sonarcloud.io/summary/new_code?id=ThinkDeepTech_thinkdeep)
[![Coverage Status](https://coveralls.io/repos/github/ThinkDeepTech/thinkdeep/badge.svg?branch=master)](https://coveralls.io/github/ThinkDeepTech/thinkdeep?branch=master)
[![Maintainability](https://api.codeclimate.com/v1/badges/a9eb1d6f95a73bfda23d/maintainability)](https://codeclimate.com/github/ThinkDeepTech/thinkdeep/maintainability)
[<img src="https://i.stack.imgur.com/gVE0j.png" height="20" width="20">](https://www.linkedin.com/in/haydenmcp/)
[<img src="https://i.stack.imgur.com/tskMh.png" height="20" width="20">](https://github.com/haydenmcp)


[![Economic Analyzer Vulnerabilities](https://snyk.io/test/github/ThinkDeepTech/thinkdeep/master/badge.svg?targetFile=packages/deep-economic-analyzer/package.json)](https://snyk.io/test/github/ThinkDeepTech/thinkdeep/master?targetFile=packages/deep-economic-analyzer/package.json)
[![Collection Microservice Vulnerabilities](https://snyk.io/test/github/ThinkDeepTech/thinkdeep/master/badge.svg?targetFile=packages/deep-microservice-collection/package.json)](https://snyk.io/test/github/ThinkDeepTech/thinkdeep/master?targetFile=packages/deep-microservice-collection/package.json)
[![Subscription Microservice Vulnerabilities](https://snyk.io/test/github/ThinkDeepTech/thinkdeep/master/badge.svg?targetFile=packages/deep-microservice-subscription/package.json)](https://snyk.io/test/github/ThinkDeepTech/thinkdeep/master?targetFile=packages/deep-microservice-subscription/package.json)
[![Data Collector Vulnerabilities](https://snyk.io/test/github/ThinkDeepTech/thinkdeep/master/badge.svg?targetFile=packages/data-collector/package.json)](https://snyk.io/test/github/ThinkDeepTech/thinkdeep/master?targetFile=packages/data-collector/package.json)


The main purpose of this repository is to learn while developing something cool. It's a bit of an experiment.

## Global Dependencies
- [Node v16.14.2](https://nodejs.org/en/)
- [Lerna v5.0.0](https://github.com/lerna/lerna)
- [Snyk CLI v1.936.0](https://github.com/snyk/cli)
- [Yarn v1.22.0](https://yarnpkg.com/)
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
[Lit](https://lit.dev) has multiple benefits. First, it's familiar which is significant. However, it's also incredibly fast and light-weight.
When benchmarked against React it renders 30% faster for a large number of DOM nodes. Lit came about as a result of the
Polymer project at Google which had the goal of reducing use of javascript frameworks focused on creating custom elements. Those frameworks
are essentially needed because the browser doesn't perform it's job well enough. It's ideal to move the custom component concept into the browser itself instead
of relying on frameworks. Frameworks introduce additional layers which increase execution time. They prevent
reuse of custom components from one framework to the next making it difficult to migrate to a different framework as well as
requiring recreation of components that may already be available publicly (i.e, on GitHub). With adoption of custom elements support
in numerous popular browsers those frameworks are no longer needed though they're still extremely popular. It's notable
that wide-spread use of frameworks means many developers are familiar with them and, therefore, it may be difficult to find developers
who know, i.e, Lit because it's newer. However, that may change. All of this is to say, Lit was also chosen because it
continues that goal of using the platform resulting in performance gains and increasing compatibility with the current javascript ecosystem.

#### Rollup
Building the application is done using rollup because it has a clean, concise syntax. WebPack is extremely customizable but it's more
confusing to maintain. Right now, builds aren't doing anything complex so this fits my use case.

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
[Bitnami Kafka](https://github.com/bitnami/bitnami-docker-kafka) is used for the kafka instance.
Kafka is a messaging system that's heavily used for events. It's been around for a while and is battle-tested. It's not
the fastest option out there. But events persist (it's not in-memory) and the interface is simple in combination with [KafkaJS](https://kafka.js.org/). Production-readiness is obvious given its use by many large companies. Kafka use enables powerful real-time capabilities
for the application.

#### Apollo GraphQL
[Apollo GraphQL](https://www.apollographql.com/) provides a production-ready GraphQL implementation with some powerful features.
For a microservices architecture, our goal is to create isolated units that have a single responsibility and that can scale
independently. I've used Apollo federation because it's viewed
as a better way of isolating microservice responsibilities. Specifically, a microservice defines its own types
but it also defines how its interface is used by other microservices. This, in theory, encapsulates all of the code relating to a given
service in one codebase. One benefit of that would be full-stack development can be done without making changes that collide
with another teams changes provided that the interface isn't changed. Federation provides mechanisms for connecting a subgraph
to a full application supergraph in a seamless way. It uses a single gateway that provides access to the remaining
services. This gateway is the publicly accessible end-point for the microservices and routes requests to the necessary
microservices needed to gather the response. This concept is used because it's intended to introduce additional
microservices that will perform tasks such as data fetching/collection, data cleaning and data analysis. Additional benefits
include reducing the number of requests that need to go over the wire to gather data when
compared to RESTful APIs. It's backed by facebook and is used by numerous companies and is therefore battle-tested. It's also fun. :-)

#### Kubernetes
[Kubernetes](https://kubernetes.io/) is a container orchestration system with many powerful characteristics. It's used in this
project to take advantage of self-healing, monitoring, replication and load-balancing.

#### Helm
[Helm](https://helm.sh/) goes quite well with kubernetes. Management of kubernetes manifests becomes difficult as multiple deployments become necessary because a new set of manifests needs to be created for each environment. I.e, development vs. production. Helm solves this issue by allowing kubernetes
manifest templates to be created so that concrete manifests can be generated based on desired configurations. In my case, this has allowed one-click
manual deployment of the entire project and its dependencies regardless of the environment. It also allows simple configuration of certificates if TLS is desired. Based on kubernetes service hostname defaults you can also wire up each deployment to the necessary services used making the manual deployment process extremely easy. Uninstall is equally easy. Helm provides this as well as easy version management and many other features.

#### Docker
Docker provides containerization and is used for a couple of reasons. It allows developers to reproduce bugs that are seen in different
environments such as production. It encapsulates application dependencies and configuration such that each application will run
without worry about conflicts. It allows for easy backup and it takes up a much smaller
footprint than virtual machines. It's also moving toward greater adoption on multiple platforms such as windows.

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
