FROM node:18.4-alpine

WORKDIR /bot

RUN apk update && \
    apk add wget python3 build-base

COPY ./package*.json /bot/
RUN npm ci

COPY ./src /bot/src
COPY ./tsconfig.json /bot/tsconfig.json

CMD ["npm", "run", "prod", "--prefix", "/bot"]
