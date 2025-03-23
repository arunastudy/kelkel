FROM node:18-alpine

WORKDIR /app

# Устанавливаем базовые зависимости
RUN apk add --no-cache python3

# Копируем файлы зависимостей
COPY package*.json ./
COPY prisma ./prisma/

# Устанавливаем зависимости
RUN npm uninstall bcrypt && npm install bcryptjs
RUN npm install

# Генерируем Prisma клиент
RUN npx prisma generate

# Копируем исходный код
COPY . .

# Очищаем кэш и временные файлы
RUN rm -rf .next
RUN npm cache clean --force

# Собираем приложение
RUN npm run build

# Запускаем приложение
CMD ["npm", "start"] 