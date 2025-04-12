FROM node:23-slim AS dev

ENV NODE_ENV=development

WORKDIR /app

COPY package.json pnpm-lock.yaml ./

RUN npm install -g pnpm

RUN pnpm config set global-bin-dir /usr/local/bin

FROM node:23-slim AS prod

ENV NODE_ENV=production

WORKDIR /app

COPY package.json pnpm-lock.yaml ./

RUN npm install -g pnpm

RUN pnpm config set global-bin-dir /usr/local/bin

RUN pnpm install

COPY . .

RUN pnpm run build
