FROM node:20 AS base
WORKDIR /app

# Install dependencies and build
FROM base AS build
COPY package*.json ./
# Increase timeout and add retries for network issues
RUN npm config set fetch-timeout 300000 && \
    npm config set fetch-retries 5 && \
    npm config set fetch-retry-mintimeout 20000 && \
    npm config set fetch-retry-maxtimeout 120000 && \
    npm ci --legacy-peer-deps
COPY tsconfig*.json ./
COPY src ./src
RUN npm run build

# Production image
FROM base AS runner
ENV NODE_ENV=production
WORKDIR /app

# Install only production dependencies
COPY package*.json ./
# Increase timeout and add retries for network issues
RUN npm config set fetch-timeout 300000 && \
    npm config set fetch-retries 5 && \
    npm config set fetch-retry-mintimeout 20000 && \
    npm config set fetch-retry-maxtimeout 120000 && \
    npm ci --omit=dev --legacy-peer-deps

# Copy compiled app
COPY --from=build /app/dist ./dist

# Create uploads directory for file storage
RUN mkdir -p /app/uploads

EXPOSE 3001
CMD ["node", "dist/main"]
