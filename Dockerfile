FROM node:20-slim

WORKDIR /app

# Copy package files and install ALL dependencies (need devDeps for build)
COPY package.json package-lock.json ./
RUN npm ci

# Copy source code
COPY . .

# Build the frontend
RUN npm run build

# Prune dev dependencies after build
RUN npm prune --production

# Expose port
EXPOSE 3001
ENV PORT=3001
ENV NODE_ENV=production

# Start the server
CMD ["npm", "start"]
