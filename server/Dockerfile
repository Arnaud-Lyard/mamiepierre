FROM node:20.9.0-alpine3.17

RUN apk --no-cache add curl
RUN apk add make g++ python3 git
RUN npm i -g node-pre-gyp

RUN mkdir /app
WORKDIR /app

COPY package*.json ./

RUN npm i


COPY src src
COPY tsconfig.json tsconfig.json
COPY prisma prisma
COPY public public
COPY .env .env

RUN npx prisma generate
CMD npm run start