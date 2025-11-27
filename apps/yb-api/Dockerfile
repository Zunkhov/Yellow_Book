# adoptable/apps/yb-api/Dockerfile
FROM node:20-alpine AS builder

WORKDIR /app

# Copy package files
COPY package*.json ./
COPY apps/yb-api/package*.json ./apps/yb-api/

# Install dependencies
RUN npm ci

# Copy source code
COPY . .

# Generate Prisma client
RUN npx prisma generate

# Build
RUN npx nx build yb-api --prod

# Production image
FROM node:20-alpine AS runner

WORKDIR /app

ENV NODE_ENV=production

# Copy built artifacts
COPY --from=builder /app/dist/apps/yb-api ./
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/apps/yb-api/prisma ./prisma

# Expose port
EXPOSE 3333

# Start server
CMD ["node", "main.js"]