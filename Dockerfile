FROM node:20-alpine AS build

WORKDIR /app

COPY package.json package-lock.json ./
RUN npm ci

COPY . .

ARG WP_SITE_URL=https://rudrakasturi.wordpress.com
ENV WP_SITE_URL=${WP_SITE_URL}

RUN npm run build

FROM node:20-alpine AS runtime

WORKDIR /app

COPY --from=build /app/dist ./dist
COPY --from=build /app/node_modules ./node_modules
COPY --from=build /app/package.json ./

ENV HOST=0.0.0.0
ENV PORT=8080
ENV ANTHROPIC_API_KEY=""

EXPOSE 8080

CMD ["node", "dist/server/entry.mjs"]
