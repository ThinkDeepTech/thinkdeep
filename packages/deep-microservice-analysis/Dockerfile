FROM ubuntu:20.04

ARG PREDECOS_MICROSERVICE_COLLECTION_URL
ARG PREDECOS_PG_CONNECTION_STRING
ARG NODE_ENV

ENV PREDECOS_MICROSERVICE_COLLECTION_URL=$PREDECOS_MICROSERVICE_COLLECTION_URL
ENV PREDECOS_PG_CONNECTION_STRING=$PREDECOS_PG_CONNECTION_STRING
ENV NODE_ENV=$NODE_ENV

ENV BASE_DIRECTORY=/usr/src/app

WORKDIR $BASE_DIRECTORY

RUN apt-get update

RUN apt-get install -y curl

# Add nodejs 16.x
RUN /bin/bash -c "curl -sL https://deb.nodesource.com/setup_16.x | bash -"

RUN apt-get update

RUN apt-get install -y nodejs

RUN npm i --global yarn

RUN yarn --version

RUN mkdir ./src

COPY src/ ./src/

COPY package.json $BASE_DIRECTORY/

RUN yarn install

WORKDIR $BASE_DIRECTORY/node_modules/deep-graphql-binding

RUN yarn install

WORKDIR $BASE_DIRECTORY

EXPOSE 4001

CMD ["yarn", "run", "start"]