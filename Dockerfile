FROM node:18-alpine

WORKDIR /app

# Устанавливаем базовые зависимости
RUN apk add --no-cache python3

# Копируем только файлы, необходимые для установки зависимостей
COPY package*.json ./
COPY prisma ./prisma/

# Устанавливаем зависимости с флагами для оптимизации памяти
RUN npm uninstall bcrypt && \
    npm install bcryptjs --no-audit --no-fund && \
    npm ci --no-audit --no-fund --production=false && \
    npm install sharp --no-audit --no-fund && \
    npx prisma generate

# Копируем остальные файлы
COPY . .

# Генерируем Prisma клиент и собираем приложение
RUN NODE_OPTIONS="--max-old-space-size=2048" npx prisma generate && \
    NODE_OPTIONS="--max-old-space-size=2048" npm run build

# Очищаем ненужные файлы
RUN npm prune --production && \
    rm -rf /root/.npm /root/.node-gyp /tmp/*

CMD ["npm", "start"] 