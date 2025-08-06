FROM node:18-alpine AS base

# Установка зависимостей для сборки
FROM base AS deps
RUN apk add --no-cache libc6-compat
WORKDIR /app

# Копируем файлы package.json и prisma
COPY package.json ./
COPY prisma ./prisma/

# Устанавливаем все зависимости (включая devDependencies)
RUN npm install --production=false
RUN npm install read-package-up

# Генерируем Prisma Client
RUN npx prisma generate

# Сборка приложения
FROM base AS builder
WORKDIR /app

# Копируем зависимости из предыдущего этапа
COPY --from=deps /app/node_modules ./node_modules
COPY --from=deps /app/prisma ./prisma
COPY . .

# Переменные окружения для сборки
ARG DATABASE_URL
ARG IMGBB_API_KEY
ARG TELEGRAM_BOT_TOKEN
ENV DATABASE_URL=$DATABASE_URL
ENV IMGBB_API_KEY=$IMGBB_API_KEY
ENV TELEGRAM_BOT_TOKEN=$TELEGRAM_BOT_TOKEN
ENV NEXT_TELEMETRY_DISABLED=1
ENV NODE_ENV=production

# Генерация Prisma Client и сборка
RUN npx prisma generate
RUN npm run build

# Продакшен образ
FROM base AS runner
WORKDIR /app

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1

# Копируем необходимые файлы
COPY --from=builder /app/public ./public
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static
COPY --from=builder /app/prisma ./prisma
COPY --from=builder /app/node_modules/.prisma ./node_modules/.prisma
COPY --from=builder /app/node_modules/@prisma ./node_modules/@prisma
COPY --from=builder /app/node_modules/read-package-up ./node_modules/read-package-up

# Копируем package.json и устанавливаем только production зависимости
COPY package.json ./
RUN npm install --omit=dev
RUN npm install read-package-up

# Добавляем пользователя для безопасности
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs
RUN chown -R nextjs:nodejs /app
USER nextjs

EXPOSE 3000

ENV PORT=3000
ENV HOSTNAME=0.0.0.0

CMD ["node", "server.js"]