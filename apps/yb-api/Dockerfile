# adoptable/apps/yb-api/Dockerfile
FROM node:20-alpine AS builder

WORKDIR /app

# Copy root config files
COPY package*.json package-lock.json ./
COPY nx.json tsconfig.base.json tsconfig.json jest.config.ts jest.preset.js eslint.config.mjs ./

# Copy package files for workspaces
COPY apps/yb-api/package*.json ./apps/yb-api/
COPY shared-contract/package*.json ./shared-contract/

# Prevent Cypress from downloading its binary during install inside the container
ENV CYPRESS_INSTALL_BINARY=0
ENV SKIP_BINARY_DOWNLOAD_FOR_CYPRESS=1

# Install dependencies
RUN npm ci

# Copy source code
COPY prisma ./prisma
COPY apps/yb-api ./apps/yb-api
COPY shared-contract ./shared-contract

# Generate Prisma client
RUN npx prisma generate

# Sync Nx workspace
RUN npx nx sync

# Build (disable daemon in Docker)
ENV NX_DAEMON=false
RUN npx nx build yb-api --prod --skip-nx-cache

# Production image
FROM node:20-alpine AS runner

WORKDIR /app

ENV NODE_ENV=production

# Copy built artifacts (webpack outputs to apps/yb-api/dist)
COPY --from=builder /app/apps/yb-api/dist ./
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/prisma ./prisma

# Expose port
EXPOSE 3333

# Start server
CMD ["node", "main.js"]