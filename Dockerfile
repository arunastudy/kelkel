FROM node:18-alpine

WORKDIR /app

# Устанавливаем базовые зависимости
RUN apk add --no-cache python3

# Устанавливаем переменные окружения
ENV DATABASE_URL="postgresql://postgres:postgres@db:5432/apakai?schema=public"
ENV NODE_ENV=production

COPY package*.json ./
COPY prisma ./prisma/

# Устанавливаем зависимости
RUN npm uninstall bcrypt && npm install bcryptjs
RUN npm install

# Копируем все файлы
COPY . .

# Генерируем Prisma Client
RUN npx prisma generate

# Собираем приложение
RUN npm run build

CMD ["npm", "start"] 