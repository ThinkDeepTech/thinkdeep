FROM nikolaik/python-nodejs:python3.9-nodejs16

WORKDIR /usr/src/app

COPY src/ ./src

COPY package.json ./

RUN yarn install