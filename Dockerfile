# Базовый образ Node.js 20 Alpine
FROM node:20-alpine AS base

# Слой для установки зависимостей
FROM base AS deps
WORKDIR /app

# Устанавливаем необходимые системные зависимости
RUN apk add --no-cache libc6-compat python3 make g++ build-base

# Копируем файлы зависимостей
COPY package.json package-lock.json ./
COPY prisma ./prisma/

# Устанавливаем зависимости с настройками для стабильности
RUN npm config set registry https://registry.npmjs.org/ && \
    npm config set fetch-retry-maxtimeout 600000 && \
    npm config set fetch-retry-mintimeout 100000 && \
    npm config set fetch-timeout 600000 && \
    npm install --legacy-peer-deps --no-audit --no-fund && \
    npm install sharp

# Слой для сборки приложения
FROM base AS builder
WORKDIR /app

# Передаем DATABASE_URL на этапе сборки
ARG DATABASE_URL
ENV DATABASE_URL=${DATABASE_URL}

# Отключаем телеметрию Next.js на этапе сборки
ENV NEXT_TELEMETRY_DISABLED 1
ENV NODE_ENV=production

# Копируем зависимости из предыдущего слоя
COPY --from=deps /app/node_modules ./node_modules
COPY --from=deps /app/prisma ./prisma

# Копируем всё остальное
COPY . .

# Генерация Prisma Client и сборка
RUN npx prisma generate
RUN npm run build

# Продакшен образ
FROM base AS runner
WORKDIR /app

# Устанавливаем libc6-compat для совместимости с некоторыми пакетами (например, sharp)
RUN apk add --no-cache libc6-compat

# Создание пользователя
RUN addgroup --system --gid 1001 nodejs \
    && adduser --system --uid 1001 nextjs

# Копируем только необходимые артефакты для продакшена
COPY --from=builder /app/public ./public
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static
COPY --from=builder /app/prisma ./prisma

# Создаем необходимые директории и устанавливаем права
RUN mkdir -p .next/cache/images && \
    chown -R nextjs:nodejs .next && \
    chown -R nextjs:nodejs /app

USER nextjs

ENV NODE_ENV=production
ENV PORT=3000
ENV HOSTNAME=0.0.0.0
ENV NEXT_TELEMETRY_DISABLED 1

EXPOSE 3000

CMD ["node", "server.js"]