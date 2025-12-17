# adoptable/apps/adoptable/Dockerfile
FROM node:20-alpine AS builder

WORKDIR /app

# Copy root config files
COPY package*.json package-lock.json ./
COPY nx.json tsconfig.base.json tsconfig.json jest.config.ts jest.preset.js eslint.config.mjs ./

# Copy package files for workspaces
COPY apps/adoptable/package*.json ./apps/adoptable/
COPY shared-contract/package*.json ./shared-contract/

# Prevent Cypress from downloading its binary during install inside the container
ENV CYPRESS_INSTALL_BINARY=0
ENV SKIP_BINARY_DOWNLOAD_FOR_CYPRESS=1

# Install dependencies
RUN npm ci

# Copy Prisma schema
COPY prisma ./prisma

# Copy source code
COPY apps/adoptable ./apps/adoptable
COPY shared-contract ./shared-contract

# Disable Nx daemon in Docker environment
ENV NX_DAEMON=false
ENV NX_SKIP_NX_CACHE=true

# Generate Prisma client
RUN npx prisma generate

# Sync Nx workspace and build
RUN npx nx sync || true
RUN npx nx build adoptable --prod

# Production image
FROM node:20-alpine AS runner

WORKDIR /app

ENV NODE_ENV=production
ENV PORT=3000

# Next.js standalone output structure:
# .next/standalone/ contains the full app with node_modules and apps/ folder
COPY --from=builder /app/apps/adoptable/.next/standalone ./
COPY --from=builder /app/apps/adoptable/.next/static ./apps/adoptable/.next/static  
COPY --from=builder /app/apps/adoptable/public ./apps/adoptable/public

# Expose port
EXPOSE 3000

# The server.js will be at apps/adoptable/server.js (standalone preserves workspace structure)
CMD ["node", "apps/adoptable/server.js"]