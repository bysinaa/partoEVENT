FROM node:22-alpine AS dependencies
WORKDIR /app
COPY parto-cms/package.json parto-cms/package-lock.json ./
COPY parto-cms/apps/admin/package.json ./apps/admin/package.json
COPY parto-cms/apps/api/package.json ./apps/api/package.json
RUN npm ci

FROM dependencies AS builder
WORKDIR /app
ENV NEXT_TELEMETRY_DISABLED=1
COPY parto-cms ./
ARG NEXT_PUBLIC_API_URL
ENV NEXT_PUBLIC_API_URL=$NEXT_PUBLIC_API_URL
RUN npm run build --workspace @parto/admin

FROM node:22-alpine AS runtime
WORKDIR /app
ENV NODE_ENV=production \
    NEXT_TELEMETRY_DISABLED=1 \
    HOSTNAME=0.0.0.0 \
    PORT=3003
RUN addgroup -S nodejs && adduser -S nextjs -G nodejs
COPY --from=builder --chown=nextjs:nodejs /app/apps/admin/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/apps/admin/.next/static ./apps/admin/.next/static
COPY --from=builder --chown=nextjs:nodejs /app/apps/admin/public ./apps/admin/public
USER nextjs
EXPOSE 3003
CMD ["node", "apps/admin/server.js"]
