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

EXPOSE 4003

# NOTE: Do not use npm to run a script as the CMD. When k8s shuts the pod down npm doesn't
# propagate the SIGTERM signal to child processes which keeps cleanup code from executing.
CMD ["node", "./src/index.mjs"]