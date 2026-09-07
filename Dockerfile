# Multi-stage Dockerfile for Nuxt Application with Puppeteer support

# Stage 1: Dependencies
FROM node:26-alpine AS deps
RUN apk add --no-cache libc6-compat

# Install pnpm
RUN npm install --global pnpm@12.3.4

WORKDIR /app

# Copy package files
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
ENV PUPPETEER_SKIP_DOWNLOAD=true
RUN pnpm install --frozen-lockfile --ignore-scripts

# Stage 2: Builder
FROM node:26-alpine AS builder

# Install pnpm
RUN npm install --global pnpm@12.3.4

WORKDIR /app

# Copy dependencies from deps stage
COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Accept build arguments for Google AdSense configuration
ARG NUXT_PUBLIC_GOOGLE_ADSENSE_ACCOUNT
ARG NUXT_PUBLIC_GOOGLE_ADSENSE_ENABLED

# Export as environment variables for Nuxt build
ENV NUXT_PUBLIC_GOOGLE_ADSENSE_ACCOUNT=${NUXT_PUBLIC_GOOGLE_ADSENSE_ACCOUNT}
ENV NUXT_PUBLIC_GOOGLE_ADSENSE_ENABLED=${NUXT_PUBLIC_GOOGLE_ADSENSE_ENABLED}

# Run approved dependency builds after source files are available.
ENV PUPPETEER_SKIP_DOWNLOAD=true
RUN pnpm rebuild && pnpm exec nuxt prepare

# Build the Nuxt application
RUN pnpm build && pnpm test:build

# Stage 3: Runner
FROM node:26-alpine AS runner
WORKDIR /app

ENV NODE_ENV=production

# Install Puppeteer dependencies
RUN apk add --no-cache \
    chromium \
    nss \
    freetype \
    harfbuzz \
    ca-certificates \
    ttf-freefont

# Tell Puppeteer to use the installed Chromium
ENV PUPPETEER_EXECUTABLE_PATH=/usr/bin/chromium-browser
ENV PUPPETEER_SKIP_CHROMIUM_DOWNLOAD=true

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nuxt

# Copy the built application from builder
COPY --from=builder --chown=nuxt:nodejs /app/.output /app/.output

USER nuxt

EXPOSE 3000

ENV PORT=3000
ENV HOST=0.0.0.0

CMD ["node", ".output/server/index.mjs"]
