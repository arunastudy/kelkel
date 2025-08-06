FROM node:18-alpine AS base

# Установка зависимостей для сборки
FROM base AS deps
RUN apk add --no-cache libc6-compat
WORKDIR /app

# Копируем файлы package.json и package-lock.json
COPY package.json package-lock.json ./

# Устанавливаем зависимости
RUN npm ci

# Сборка приложения
FROM base AS builder
WORKDIR /app

# Копируем зависимости из предыдущего этапа
COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Устанавливаем дополнительные зависимости для Tailwind
RUN npm install -D @tailwindcss/forms

# Переменные окружения для сборки
ARG DATABASE_URL
ARG IMGBB_API_KEY
ARG TELEGRAM_BOT_TOKEN
ENV DATABASE_URL=$DATABASE_URL
ENV IMGBB_API_KEY=$IMGBB_API_KEY
ENV TELEGRAM_BOT_TOKEN=$TELEGRAM_BOT_TOKEN

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

# Устанавливаем только production зависимости
COPY package.json package-lock.json ./
RUN npm ci --only=production

# Добавляем пользователя для безопасности
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs
RUN chown -R nextjs:nodejs /app
USER nextjs

EXPOSE 3000

ENV PORT=3000
ENV HOSTNAME=0.0.0.0

CMD ["node", "server.js"]