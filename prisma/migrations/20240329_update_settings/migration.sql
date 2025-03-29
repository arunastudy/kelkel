-- Создаем временную таблицу для сохранения данных
CREATE TABLE "Settings_temp" (
    "id" TEXT NOT NULL,
    "key" TEXT NOT NULL,
    "value" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "Settings_temp_pkey" PRIMARY KEY ("id")
);

-- Создаем уникальный индекс для ключа
CREATE UNIQUE INDEX "Settings_temp_key_key" ON "Settings_temp"("key");

-- Копируем существующие данные в новый формат
INSERT INTO "Settings_temp" ("id", "key", "value", "createdAt", "updatedAt")
SELECT "id", 'telegram_id', "telegramId", "createdAt", "updatedAt"
FROM "Settings";

-- Удаляем старую таблицу
DROP TABLE "Settings";

-- Переименовываем временную таблицу
ALTER TABLE "Settings_temp" RENAME TO "Settings";

-- Создаем уникальный индекс для ключа в новой таблице
CREATE UNIQUE INDEX "Settings_key_key" ON "Settings"("key"); 