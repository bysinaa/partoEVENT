FROM node:22-alpine AS dependencies
WORKDIR /app
COPY parto-cms/package.json parto-cms/package-lock.json ./
COPY parto-cms/apps/admin/package.json ./apps/admin/package.json
COPY parto-cms/apps/api/package.json ./apps/api/package.json
RUN npm ci

FROM dependencies AS builder
WORKDIR /app
COPY parto-cms ./
WORKDIR /app/apps/api
RUN npx prisma generate && npm run build

FROM node:22-alpine AS production-dependencies
WORKDIR /app
COPY parto-cms/package.json parto-cms/package-lock.json ./
COPY parto-cms/apps/admin/package.json ./apps/admin/package.json
COPY parto-cms/apps/api/package.json ./apps/api/package.json
RUN npm ci --omit=dev

FROM node:22-alpine AS runtime
WORKDIR /app/apps/api
ENV NODE_ENV=production \
    API_PORT=3006
COPY --from=production-dependencies /app/node_modules /app/node_modules
COPY --from=production-dependencies /app/apps/api/node_modules ./node_modules
COPY --from=production-dependencies /app/apps/api/package.json ./package.json
COPY --from=builder /app/apps/api/dist ./dist
COPY --from=builder /app/apps/api/generated ./generated
COPY --from=builder /app/apps/api/prisma ./prisma
RUN mkdir -p uploads && chown -R node:node /app/apps/api
USER node
EXPOSE 3006
HEALTHCHECK --interval=30s --timeout=5s --start-period=15s --retries=5 \
  CMD wget -qO- http://127.0.0.1:3006/api/v1/api/public/settings >/dev/null || exit 1
CMD ["sh", "-c", "../../node_modules/.bin/prisma migrate deploy && exec node dist/main.js"]
