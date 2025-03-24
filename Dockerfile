FROM node:18-alpine

WORKDIR /app

# Устанавливаем базовые зависимости
RUN apk add --no-cache python3

COPY package*.json ./
COPY prisma ./prisma/

# Устанавливаем зависимости
RUN npm uninstall bcrypt && npm install bcryptjs
RUN npm ci
RUN npm install sharp

RUN npx prisma generate

COPY . .

RUN npx prisma generate

RUN npm run build

CMD ["npm", "start"] 