FROM nikolaik/python-nodejs:python3.9-nodejs16

ARG PORT;

ENV BASE_DIRECTORY=/usr/src/app

WORKDIR $BASE_DIRECTORY

RUN mkdir ./src

COPY src/ ./src/

COPY package.json $BASE_DIRECTORY/

COPY node_modules/* ./node_modules/

RUN yarn install

EXPOSE $PORT

# NOTE: Do not use npm to run a script as the CMD. When k8s shuts the pod down npm doesn't
# propagate the SIGTERM signal to child processes which keeps cleanup code from executing.
CMD ["node", "./src/index.js"]