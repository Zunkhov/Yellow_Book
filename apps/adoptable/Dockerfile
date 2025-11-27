# adoptable/apps/adoptable/Dockerfile
FROM node:20-alpine AS builder

WORKDIR /app

# Copy root config files
COPY package*.json package-lock.json ./
COPY nx.json tsconfig.base.json tsconfig.json jest.config.ts jest.preset.js ./

# Copy package files for workspaces
COPY apps/adoptable/package*.json ./apps/adoptable/
COPY shared-contract/package*.json ./shared-contract/

# Install dependencies
RUN npm ci

# Copy source code
COPY apps/adoptable ./apps/adoptable
COPY shared-contract ./shared-contract

# Sync Nx workspace
RUN npx nx sync

# Build Next.js (disable daemon in Docker)
ENV NX_DAEMON=false
RUN npx nx build adoptable --prod --skip-nx-cache

# Production image
FROM node:20-alpine AS runner

WORKDIR /app

ENV NODE_ENV=production
ENV PORT=3000

# Copy built artifacts (Next.js outputs to apps/adoptable/.next)
COPY --from=builder /app/apps/adoptable/.next/standalone ./
COPY --from=builder /app/apps/adoptable/.next/static ./apps/adoptable/.next/static
COPY --from=builder /app/apps/adoptable/public ./apps/adoptable/public

# Expose port
EXPOSE 3000

# Start server
CMD ["node", "apps/adoptable/server.js"]