FROM ubuntu:20.04

WORKDIR /usr/src/app

RUN apt-get update

RUN apt-get install -y curl

# Add nodejs 16.x
RUN /bin/bash -c "curl -sL https://deb.nodesource.com/setup_16.x | bash -"

RUN apt-get update

RUN apt-get install -y nodejs

COPY src/ ./src

COPY package.json ./

RUN npm install

EXPOSE 4002

CMD ["npm", "run", "start"]