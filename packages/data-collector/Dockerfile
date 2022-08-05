FROM nikolaik/python-nodejs:python3.9-nodejs16

ENV BASE_DIRECTORY=/usr/src/app

WORKDIR $BASE_DIRECTORY

# TODO: Modify such that node modules are copied into dir. Add caching.

COPY src/ ./src

COPY package.json ./

COPY ./node_modules/@thinkdeep/model ../model/
COPY ./node_modules/@thinkdeep/util ../util/

RUN yarn install