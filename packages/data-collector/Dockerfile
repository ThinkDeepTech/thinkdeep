FROM nikolaik/python-nodejs:python3.9-nodejs16

WORKDIR /usr/src/app

# TODO: Modify such that node modules are copied into dir. Add caching.

COPY src/ ./src

COPY package.json ./

WORKDIR /usr/src

COPY ../type/ ./type

WORKDIR /usr/src/app

RUN yarn install