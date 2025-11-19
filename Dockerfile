# Multi-stage Dockerfile for Nuxt Application with Puppeteer support

# Stage 1: Dependencies
FROM node:20-alpine AS deps
RUN apk add --no-cache libc6-compat

# Install pnpm
RUN corepack enable && corepack prepare pnpm@10.17.1 --activate

WORKDIR /app

# Copy package files
COPY package.json pnpm-lock.yaml* ./
RUN pnpm install --frozen-lockfile

# Stage 2: Builder
FROM node:20-alpine AS builder

# Install pnpm
RUN corepack enable && corepack prepare pnpm@10.17.1 --activate

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

# Build the Nuxt application
RUN pnpm build

# Stage 3: Runner
FROM node:20-alpine AS runner
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
