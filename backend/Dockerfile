# Build context: repository root (npm workspaces share one lockfile)
#   docker build -f backend/Dockerfile .

FROM node:20-alpine AS deps
RUN apk add --no-cache libc6-compat openssl
WORKDIR /app
COPY package.json package-lock.json ./
COPY backend/package.json backend/
COPY frontend/package.json frontend/
COPY backend/database backend/database
RUN npm ci --workspace backend --include-workspace-root

FROM deps AS builder
COPY backend backend
RUN npm run prisma:generate -w backend && npm run build -w backend

FROM deps AS prod-deps
RUN npm prune --omit=dev --workspace backend && npm run prisma:generate -w backend

FROM node:20-alpine AS runner
RUN apk add --no-cache libc6-compat openssl
WORKDIR /app
ENV NODE_ENV=production PORT=4000

RUN addgroup --system --gid 1001 nodejs && adduser --system --uid 1001 clinicbase

COPY --from=prod-deps --chown=clinicbase:nodejs /app/node_modules ./node_modules
COPY --from=builder --chown=clinicbase:nodejs /app/backend/dist ./dist
COPY --from=builder --chown=clinicbase:nodejs /app/backend/database ./database
COPY --chown=clinicbase:nodejs backend/package.json ./package.json

USER clinicbase
EXPOSE 4000

HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://localhost:4000/api/health || exit 1

CMD ["node", "--enable-source-maps", "dist/main.js"]
