# Deps stage
FROM node:22-alpine As base

ENV NODE_ENV development

# Build stage
FROM node:22-alpine As build

WORKDIR /app

RUN apk add --no-cache --virtual .gyp python3 make g++

COPY package*.json ./

RUN npm i -g pnpm

RUN pnpm install

COPY . .

RUN pnpm run build

RUN pnpm prune

# Prod stage
FROM node:22-alpine As prod

WORKDIR /app

RUN npm i -g pnpm

COPY --from=build /app/dist ./dist
COPY --from=build /app/package*.json ./
COPY --from=build /app/node_modules ./node_modules

CMD ["pnpm", "run", "start:prod"]

EXPOSE 3000