FROM node:20 AS base
WORKDIR /app

# Install dependencies and build
FROM base AS build
COPY package*.json ./
RUN npm ci --legacy-peer-deps
COPY tsconfig*.json ./
COPY src ./src
RUN npm run build

# Production image
FROM base AS runner
ENV NODE_ENV=production
WORKDIR /app

# Install only production dependencies
COPY package*.json ./
RUN npm ci --omit=dev --legacy-peer-deps

# Copy compiled app
COPY --from=build /app/dist ./dist

# Create uploads directory for file storage
RUN mkdir -p /app/uploads

EXPOSE 3001
CMD ["node", "dist/main"]
