# ============================================
# Parto CMS API — Multi-stage Docker Build
# ============================================

# Stage 1: Build
FROM node:20-alpine AS builder

WORKDIR /app

# Install dependencies
COPY package.json package-lock.json* ./
RUN npm ci

# Copy source
COPY . .

# Generate Prisma client
RUN npx prisma generate

# Build NestJS
RUN npm run build

# Stage 2: Production
FROM node:20-alpine AS production

WORKDIR /app

# Install tini for proper signal handling
RUN apk add --no-cache tini

# Copy package files
COPY package.json package-lock.json* ./
RUN npm ci --omit=dev

# Copy built application
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/node_modules/.prisma ./node_modules/.prisma
COPY --from=builder /app/prisma ./prisma

# Generate Prisma client for production
RUN npx prisma generate

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD wget -qO- http://localhost:3001/api/v1/health || exit 1

# Expose port
EXPOSE 3001

# Run with tini
ENTRYPOINT ["/sbin/tini", "--"]
CMD ["node", "dist/main"]