FROM node:23-slim AS dev

ENV NODE_ENV=development

WORKDIR /app

COPY package.json pnpm-lock.yaml ./

RUN npm install -g pnpm

RUN pnpm config set global-bin-dir /usr/local/bin

RUN pnpm install
