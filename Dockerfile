# Этап установки зависимостей
FROM node:18-alpine AS deps
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci

# Этап сборки
FROM node:18-alpine AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN npm run build

# Этап продакшена
FROM node:18-alpine AS runner
WORKDIR /app

ENV NODE_ENV production

# Создаем пользователя для безопасности
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

# Копируем необходимые файлы
COPY --from=builder /app/public ./public
COPY --from=builder /app/package.json ./package.json
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static

# Устанавливаем правильные разрешения
RUN chown -R nextjs:nodejs /app

# Переключаемся на непривилегированного пользователя
USER nextjs

# Открываем порт
EXPOSE 3000

# Запускаем приложение
CMD ["node", "server.js"] 