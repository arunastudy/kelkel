FROM node:18-alpine

WORKDIR /app

# Устанавливаем базовые зависимости
RUN apk add --no-cache python3 make g++

# Копируем только файлы, необходимые для установки зависимостей
COPY package*.json ./
COPY prisma ./prisma/

# Устанавливаем зависимости
RUN npm ci --no-audit --no-fund && \
    npm install sharp --no-audit --no-fund && \
    npx prisma generate && \
    npm cache clean --force

# Копируем остальные файлы
COPY . .

# Генерируем Prisma клиент и собираем приложение
RUN NODE_OPTIONS="--max-old-space-size=1024" npx prisma generate && \
    NODE_OPTIONS="--max-old-space-size=1024" npm run build

# Очищаем ненужные файлы и кэш
RUN npm prune --production && \
    npm cache clean --force && \
    rm -rf /root/.npm /root/.node-gyp /tmp/*

# Создаем непривилегированного пользователя
RUN addgroup -g 1001 -S nodejs && \
    adduser -S nextjs -u 1001 && \
    chown -R nextjs:nodejs /app

USER nextjs

CMD ["npm", "start"] 