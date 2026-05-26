FROM node:20-alpine AS build

WORKDIR /app

COPY package.json package-lock.json ./
RUN npm ci

COPY . .
RUN npm run build

FROM node:20-alpine AS runtime

WORKDIR /app

# Install PM2 process manager — restarts the app instantly if it crashes
RUN npm install -g pm2

COPY --from=build /app/dist ./dist
COPY --from=build /app/node_modules ./node_modules
COPY --from=build /app/package.json ./

ENV HOST=0.0.0.0
ENV PORT=8080
ENV NODE_ENV=production

EXPOSE 8080

# PM2 keeps the process alive — restarts within seconds if it crashes
# --no-daemon keeps PM2 in the foreground so Docker doesn't exit
CMD ["pm2-runtime", "dist/server/entry.mjs", "--name", "thesecondspring"]
