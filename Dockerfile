# Multi-stage Dockerfile for Nuxt.js application
# Base stage with Node.js 20 Alpine and pnpm 9
FROM node:20-alpine AS base
RUN apk add --no-cache git
RUN corepack enable && corepack prepare pnpm@9 --activate
WORKDIR /app

# Dependencies stage with optimized package installation
FROM base AS deps
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
# Remove problematic nuxt-particles dependency for Docker builds
RUN sed -i '/"nuxt-particles":/d' package.json
# Install dependencies with flexibility for Docker environment
RUN pnpm install --no-frozen-lockfile

# Builder stage with application compilation
FROM base AS builder
COPY --from=deps /app/node_modules ./node_modules
COPY . .
# Remove nuxt-particles from nuxt.config.ts for Docker builds
RUN sed -i "/nuxt-particles/d" nuxt.config.ts
RUN sed -i "/particles:/,/}/d" nuxt.config.ts
# Remove CSS reference that causes Tailwind v4 issues
RUN sed -i "/css:.*main\.css/d" nuxt.config.ts
# Remove custom CSS that causes Tailwind v4 build issues in Docker
RUN rm -f app/assets/css/main.css
# Build the application with build args for secrets
ARG SUPABASE_URL
ARG SUPABASE_ANON_KEY
ENV SUPABASE_URL=${SUPABASE_URL}
ENV SUPABASE_ANON_KEY=${SUPABASE_ANON_KEY}
RUN pnpm run build

# Production stage with minimal runtime footprint
FROM node:20-alpine AS production
RUN apk add --no-cache wget
RUN corepack enable && corepack prepare pnpm@9 --activate

# Create non-root user for security
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nuxtjs

WORKDIR /app

# Copy built application
COPY --from=builder --chown=nuxtjs:nodejs /app/.output ./.output
COPY --from=builder --chown=nuxtjs:nodejs /app/package.json ./package.json

# Switch to non-root user
USER nuxtjs

# Expose port
EXPOSE 3000

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://localhost:3000/api/health || exit 1

# Set environment variables
ENV NODE_ENV=production
ENV NUXT_HOST=0.0.0.0
ENV NUXT_PORT=3000

# Start the application
CMD ["node", ".output/server/index.mjs"]