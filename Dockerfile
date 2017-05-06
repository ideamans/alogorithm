FROM node:6.10.2
MAINTAINER Kunihiko Miyanaga

ARG DEBIAN_FRONTEND=noninteractive
RUN apt-get update && \
  apt-get install --assume-yes apt-utils
RUN apt-get install -y rsync

RUN apt-get update && \
  apt-get install -y libgif-dev

RUN mkdir -p /app
WORKDIR /app

ENV NPM_CONFIG_PREFIX /node_modules
COPY package.json /app/package.json
RUN npm install -g yarn@0.23

RUN yarn global add node-gyp nodemon
RUN yarn install

EXPOSE 3000
CMD ["yarn", "start"]
