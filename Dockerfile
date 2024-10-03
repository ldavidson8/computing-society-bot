FROM node:20.17.0-alpine AS build
WORKDIR /app
RUN corepack enable && corepack prepare pnpm@latest

COPY package.json pnpm-lock.yaml *.npmrc ./

RUN pnpm fetch

RUN pnpm install --offline --frozen-lockfile

COPY . .

RUN pnpm build

RUN pnpm prune --production

FROM node:20.17.0-alpine AS runner
WORKDIR /app

COPY --from=build /app/dist ./dist
COPY --from=build /app/node_modules ./node_modules
COPY --from=build /app/package.json ./package.json

ENV NODE_ENV=production

CMD ["node", "--es-module-specifier-resolution=node", "dist/bot.js"]