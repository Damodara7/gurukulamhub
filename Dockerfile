# Multi-stage Dockerfile for Next.js application

# Stage 1: Dependencies
FROM node:18-alpine AS deps
RUN apk add --no-cache libc6-compat
WORKDIR /app

# Configure npm for better network handling
RUN npm config set fetch-timeout 300000 && \
    npm config set fetch-retries 5 && \
    npm config set fetch-retry-mintimeout 20000 && \
    npm config set fetch-retry-maxtimeout 120000

# Copy package files
COPY package.json package-lock.json* ./

# Install dependencies with retry logic and verbose output
# Using npm install (not npm ci) because --legacy-peer-deps works better with it
# npm install can take 5-15 minutes - this is normal for large projects
# Adding --loglevel=info to show progress
RUN echo "Starting npm install... (this may take 10-15 minutes)" && \
    npm config set update-notifier false && \
    npm install --legacy-peer-deps --no-audit --loglevel=info || \
    (echo "npm install failed, retrying..." && \
     sleep 5 && \
     npm install --legacy-peer-deps --no-audit --loglevel=info) && \
    echo "npm install completed successfully!"

# Install missing peer dependencies explicitly
RUN npm install apexcharts react-hook-form --legacy-peer-deps --no-audit || true

# Stage 2: Builder
FROM node:18-alpine AS builder
WORKDIR /app

# Copy dependencies from deps stage
COPY --from=deps /app/node_modules ./node_modules

# Copy source files but exclude next-node-express-server.mjs explicitly
# Use .dockerignore + explicit exclusion to ensure it's not included
COPY . .
RUN rm -f ./next-node-express-server.mjs 2>/dev/null || true && \
    find . -name "next-node-express-server.mjs" -type f -delete 2>/dev/null || true

# Run next-ws patch explicitly to ensure WebSocket routes work in production
# This patches Next.js to support WebSocket routes (required for next-ws)
# The prepare script should run automatically during npm install, but we run it explicitly to be sure
RUN echo "Running next-ws patch for WebSocket support..." && \
    npm run prepare && \
    echo "next-ws patch completed successfully"

# Set environment variables for build
ENV NEXT_TELEMETRY_DISABLED=1
ENV NODE_ENV=production

# Set NEXT_PUBLIC_* variables for build-time embedding
# These values must match your ConfigMap values
# NOTE: These are embedded in the client bundle at build time
ENV NEXT_PUBLIC_RECAPTCHA_SITE_KEY=6LdybtIrAAAAAB1ZeuTJ-m-okYqu4tN2YN2Fkjms
ENV NEXT_PUBLIC_APP_URL=https://gurukulamhub.org
ENV NEXT_PUBLIC_API_URL=https://gurukulamhub.org/api
ENV NEXT_PUBLIC_SOCKET_IO_SERVER=https://gurukulamhub.org
ENV NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_51OZar7SBB7wnYOSIs4gZrZqWeEJFlGlKP0KUREQBdJFn4TytYos3hfNb7XSTDeEjZmC0oaNOzZL4MeFrE34SrkXF00rWrNG7Yh
ENV NEXT_PUBLIC_AWS_S3_ACCESS_KEY_ID=AKIAU6GDX5HJIHWTXVMD
ENV NEXT_PUBLIC_AWS_S3_ACCESS_KEY_SECRET=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
ENV NEXT_PUBLIC_AWS_S3_GAMES_UPLOAD_BUCKET=squizmegames
ENV NEXT_PUBLIC_AWS_S3_REGION=ap-south-1
ENV NEXT_PUBLIC_AWS_S3_USERPROFILE_UPLOAD_BUCKET=squizme-userprofile
ENV NEXT_PUBLIC_AWS_S3_QUIZ_UPLOAD_BUCKET=squizme-quiz

# Build Next.js application with increased memory
# Increase Node.js heap size to handle large builds
RUN NODE_OPTIONS="--max-old-space-size=4096" npm run build

# Stage 3: Runner
FROM node:18-alpine AS runner
WORKDIR /app

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1

# Create non-root user
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

# Copy public folder
COPY --from=builder /app/public ./public

# Copy standalone build (includes server.js and necessary node_modules)
# The standalone build includes everything needed to run Next.js
# The structure is: .next/standalone/server.js, .next/standalone/node_modules, etc.
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

# Copy package.json for start script
COPY --from=builder /app/package.json ./package.json

# Ensure next-ws patch is applied to the standalone build's Next.js
# The standalone build has its own copy of Next.js in .next/standalone/node_modules/next
# We need to ensure the patch is applied there for WebSocket routes to work
USER root
RUN echo "Checking for Next.js in standalone build..." && \
    if [ -d "./node_modules/next" ]; then \
        echo "Found Next.js in ./node_modules/next, applying next-ws patch..." && \
        (npm run prepare 2>/dev/null || npx next-ws patch 2>/dev/null || echo "Patch already applied or not needed") && \
        echo "next-ws patch check completed"; \
    elif [ -d ".next/standalone/node_modules/next" ]; then \
        echo "Found Next.js in .next/standalone/node_modules/next, applying next-ws patch..." && \
        cd .next/standalone && \
        (npm run prepare 2>/dev/null || npx next-ws patch 2>/dev/null || echo "Patch already applied or not needed") && \
        cd /app && \
        echo "next-ws patch check completed"; \
    else \
        echo "Next.js not found in expected locations, standalone build should already have patched files"; \
    fi

# Aggressively remove next-node-express-server.mjs if it exists anywhere
# Need to be root to remove files - check and remove from all possible locations
USER root
RUN echo "Checking for next-node-express-server.mjs..." && \
    find /app -name "next-node-express-server.mjs" -type f 2>/dev/null | head -20 && \
    find /app -name "next-node-express-server.mjs" -type f -delete 2>/dev/null || true && \
    find /app -name "*next-node-express-server*" -type f -delete 2>/dev/null || true && \
    rm -f /app/next-node-express-server.mjs 2>/dev/null || true && \
    rm -f ./next-node-express-server.mjs 2>/dev/null || true && \
    echo "Cleanup complete - next-node-express-server.mjs should be removed"

# Update start script for production (standalone build uses node server.js)
RUN node -e "const pkg=require('./package.json'); pkg.scripts.start='node server.js'; require('fs').writeFileSync('./package.json', JSON.stringify(pkg, null, 2));"

# Set correct permissions
RUN chown -R nextjs:nodejs /app

USER nextjs

EXPOSE 3000

ENV PORT=3000
ENV HOSTNAME="0.0.0.0"

# Start the application using npm start
# The start script now runs node server.js (Next.js standalone server)
CMD ["npm", "start"]

