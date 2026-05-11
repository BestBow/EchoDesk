FROM node:20-alpine AS base
WORKDIR /app

FROM base AS deps
COPY package*.json ./
COPY apps/api/package*.json ./apps/api/
COPY packages/types/package*.json ./packages/types/
RUN npm ci --workspace=apps/api --workspace=packages/types

FROM base AS builder
COPY --from=deps /app/node_modules ./node_modules
COPY apps/api ./apps/api
COPY packages/types ./packages/types
COPY package*.json ./
WORKDIR /app/apps/api
RUN npx prisma generate
RUN npm run build

FROM base AS runner
ENV NODE_ENV=production
COPY --from=builder /app/apps/api/dist ./dist
COPY --from=builder /app/apps/api/node_modules ./node_modules
COPY --from=builder /app/apps/api/prisma ./prisma
EXPOSE 3001
CMD ["node", "dist/main"]