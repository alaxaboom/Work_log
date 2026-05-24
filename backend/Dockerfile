FROM node:22-alpine AS builder

WORKDIR /app

ARG DATABASE_URL=postgresql://postgres:password@postgres:5432/work_log_db?schema=public
ENV DATABASE_URL=$DATABASE_URL

COPY package*.json ./
COPY prisma ./prisma/
COPY prisma.config.ts ./
RUN npm ci

COPY . .
RUN npx prisma generate
RUN npm run build

FROM node:22-alpine

WORKDIR /app

COPY package*.json ./
COPY prisma ./prisma/
COPY prisma.config.ts ./
RUN npm ci --omit=dev

COPY --from=builder /app/node_modules/.prisma ./node_modules/.prisma
COPY --from=builder /app/node_modules/@prisma/client ./node_modules/@prisma/client
COPY --from=builder /app/dist ./dist

ENV NODE_ENV=production
EXPOSE 5000

CMD ["sh", "-c", "npx prisma migrate deploy && npx prisma db seed && node dist/main.js"]
