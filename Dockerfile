FROM node:20-slim

WORKDIR /app

# Copy package files first for better caching
COPY package.json package-lock.json* ./

# Install ALL dependencies (need devDeps for vite build)
RUN npm install

# Copy source code
COPY . .

# Build the frontend
RUN npx vite build

# Prune dev dependencies after build
RUN npm prune --production

# Expose port
EXPOSE 3001
ENV PORT=3001
ENV NODE_ENV=production

# Start the server
CMD ["npx", "tsx", "server/index.ts"]
