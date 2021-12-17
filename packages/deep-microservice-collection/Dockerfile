FROM thinkdeep-microservice-base:v1
WORKDIR /usr/src/app
ENV PREDECOS_MONGODB_CONNECTION_STRING=$PREDECOS_MONGODB_CONNECTION_STRING
COPY src/ ./src
COPY package.json ./
RUN yarn install
EXPOSE 4002
CMD ["yarn", "run", "start"]