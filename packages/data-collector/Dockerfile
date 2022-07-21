FROM nikolaik/python-nodejs:python3.9-nodejs16

ENV BASE_DIRECTORY=/usr/src/app

WORKDIR $BASE_DIRECTORY

# TODO: Modify such that node modules are copied into dir. Add caching.

COPY src/ ./src

COPY package.json ./

WORKDIR ${BASE_DIRECTORY}/..

COPY ./node_modules/@thinkdeep/type ./type/

WORKDIR ${BASE_DIRECTORY}

RUN yarn install