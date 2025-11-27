# adoptable/apps/adoptable/Dockerfile
FROM node:20-alpine AS builder

WORKDIR /app

# Copy root package files
COPY package*.json ./
COPY nx.json tsconfig.base.json tsconfig.json ./

# Copy package files for workspaces
COPY apps/adoptable/package*.json ./apps/adoptable/
COPY shared-contract/package*.json ./shared-contract/

# Install dependencies
RUN npm ci

# Copy source code
COPY apps/adoptable ./apps/adoptable
COPY shared-contract ./shared-contract

# Build Next.js
RUN npx nx build adoptable --prod

# Production image
FROM node:20-alpine AS runner

WORKDIR /app

ENV NODE_ENV=production
ENV PORT=3000

# Copy built artifacts
COPY --from=builder /app/dist/apps/adoptable/.next/standalone ./
COPY --from=builder /app/dist/apps/adoptable/.next/static ./.next/static
COPY --from=builder /app/dist/apps/adoptable/public ./public

# Expose port
EXPOSE 3000

# Start server
CMD ["node", "server.js"]