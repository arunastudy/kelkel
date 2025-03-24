FROM node:18-alpine

WORKDIR /app

# Устанавливаем базовые зависимости
RUN apk add --no-cache python3

# Копируем только файлы, необходимые для установки зависимостей
COPY package*.json ./
COPY prisma ./prisma/

# Устанавливаем зависимости пошагово
RUN npm uninstall bcrypt && \
    npm install bcryptjs --no-audit --no-fund && \
    npm cache clean --force

RUN npm ci --no-audit --no-fund --production=false && \
    npm cache clean --force

RUN npm install sharp --no-audit --no-fund && \
    npm cache clean --force

RUN npx prisma generate && \
    npm cache clean --force

# Копируем остальные файлы
COPY . .

# Генерируем Prisma клиент и собираем приложение с ограниченной памятью
RUN NODE_OPTIONS="--max-old-space-size=512" npx prisma generate && \
    NODE_OPTIONS="--max-old-space-size=512" npm run build

# Очищаем ненужные файлы и кэш
RUN npm prune --production && \
    npm cache clean --force && \
    rm -rf /root/.npm /root/.node-gyp /tmp/*

CMD ["npm", "start"] 