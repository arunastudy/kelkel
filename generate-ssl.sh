#!/bin/bash

# Создаем директорию для SSL-сертификатов
mkdir -p nginx/ssl

# Генерируем самоподписанный сертификат
openssl req -x509 -nodes -days 365 -newkey rsa:2048 \
  -keyout nginx/ssl/privkey.pem \
  -out nginx/ssl/fullchain.pem \
  -subj "/C=RU/ST=State/L=City/O=Organization/CN=62.113.41.23"

# Устанавливаем правильные разрешения
chmod 600 nginx/ssl/privkey.pem
chmod 644 nginx/ssl/fullchain.pem 