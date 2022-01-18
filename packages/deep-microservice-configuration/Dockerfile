FROM ubuntu:20.04

ARG PREDECOS_MONGODB_CONNECTION_STRING
ARG NODE_ENV

ENV PREDECOS_MONGODB_CONNECTION_STRING=$PREDECOS_MONGODB_CONNECTION_STRING
ENV NODE_ENV=$NODE_ENV

WORKDIR /usr/src/app

RUN apt-get update

RUN apt-get install -y curl

# Add nodejs 16.x
RUN /bin/bash -c "curl -sL https://deb.nodesource.com/setup_16.x | bash -"

RUN apt-get update

RUN apt-get install -y vim

RUN apt-get install -y nodejs

RUN npm i --global yarn

RUN yarn --version

COPY src/ ./src

COPY package.json ./

RUN yarn install

EXPOSE 4003

CMD ["yarn", "run", "start"]