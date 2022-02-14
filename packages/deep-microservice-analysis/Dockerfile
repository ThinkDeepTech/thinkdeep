FROM ubuntu:20.04

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

EXPOSE 4001

CMD ["yarn", "run", "start"]