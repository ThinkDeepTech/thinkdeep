FROM ubuntu:20.04

WORKDIR /usr/src/app

RUN apt-get update

RUN apt-get install -y curl

# Add nodejs 16.x
RUN /bin/bash -c "curl -sL https://deb.nodesource.com/setup_16.x | bash -"

RUN apt-get update

RUN apt-get install -y build-essential

RUN apt-get install -y nodejs

RUN npm i --global yarn

RUN yarn --version

COPY src/ ./src

COPY package.json ./

RUN yarn install

EXPOSE 4004

CMD ["yarn", "run", "start"]