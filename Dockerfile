# Multi-stage Dockerfile for Nuxt.js application
# Base stage with Node.js 20 Alpine and pnpm 9
FROM node:20-alpine AS base
RUN apk add --no-cache git
RUN corepack enable && corepack prepare pnpm@9 --activate
WORKDIR /app

# Dependencies stage with optimized package installation
FROM base AS deps
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml .npmrc ./
RUN pnpm install --frozen-lockfile

# Builder stage with application compilation
FROM base AS builder
COPY --from=deps /app/node_modules ./node_modules
COPY . .
# Build the application with build args for secrets
ARG SUPABASE_URL
ARG SUPABASE_KEY
ENV SUPABASE_URL=${SUPABASE_URL}
ENV SUPABASE_KEY=${SUPABASE_KEY}
RUN pnpm run build

# pdf-parse is loaded via createRequire and not bundled by Nitro
RUN node -e "\
  const v = require('./node_modules/pdf-parse/package.json').version; \
  require('fs').mkdirSync('/app/runtime', { recursive: true }); \
  require('fs').writeFileSync('/app/runtime/package.json', JSON.stringify({ \
    name: 'nuxt-app-runtime-externals', private: true, dependencies: { 'pdf-parse': v } \
  }, null, 2));"

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

COPY --from=builder /app/runtime ./runtime
RUN cd runtime && pnpm install --prod --ignore-scripts && \
    chown -R nuxtjs:nodejs /app/runtime/node_modules && \
    rm -rf /root/.cache /root/.local/share/pnpm \
           /usr/local/lib/node_modules/npm /usr/local/bin/npm /usr/local/bin/npx /usr/local/bin/corepack
ENV NODE_PATH=/app/runtime/node_modules

# Switch to non-root user
USER nuxtjs

# Expose port
EXPOSE 3000

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD wget --no-verbose --tries=1 -O /dev/null http://127.0.0.1:3000/api/health || exit 1

# Set environment variables
ENV NODE_ENV=production
ENV NUXT_HOST=0.0.0.0
ENV NUXT_PORT=3000

# Start the application
CMD ["node", ".output/server/index.mjs"]
