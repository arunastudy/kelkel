'use client';

import { useState, useEffect } from 'react';

export default function SettingsPage() {
  const [telegramId, setTelegramId] = useState('');
  const [login, setLogin] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      const [telegramResponse, loginResponse] = await Promise.all([
        fetch('/api/admin/settings/telegram'),
        fetch('/api/admin/settings/credentials')
      ]);

      if (telegramResponse.ok) {
        const telegramData = await telegramResponse.json();
        setTelegramId(telegramData.telegramId || '');
      }

      if (loginResponse.ok) {
        const loginData = await loginResponse.json();
        setLogin(loginData.login || '');
      }
    } catch (error) {
      console.error('Error fetching settings:', error);
      setError('Ошибка при загрузке настроек');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    setSuccess('');

    try {
      // Сохраняем Telegram ID
      const response = await fetch('/api/admin/settings/telegram', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ telegramId })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Ошибка при обновлении Telegram ID');
      }

      // Если есть пароль, обновляем учетные данные
      if (password) {
        const credentialsResponse = await fetch('/api/admin/settings/credentials', {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ login, password })
        });

        const credData = await credentialsResponse.json();

        if (!credentialsResponse.ok) {
          throw new Error(credData.error || 'Ошибка при обновлении учетных данных');
        }
      }

      setSuccess('Настройки успешно обновлены');
      if (password) {
        setPassword('');
      }
    } catch (error) {
      console.error('Error updating settings:', error);
      setError(error instanceof Error ? error.message : 'Ошибка при обновлении настроек');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div>
      <h1 className="text-3xl font-bold text-white mb-6">Настройки</h1>

      {error && (
        <div className="bg-red-500/10 border border-red-500 text-red-500 px-4 py-2 rounded-lg mb-4">
          {error}
        </div>
      )}

      {success && (
        <div className="bg-green-500/10 border border-green-500 text-green-500 px-4 py-2 rounded-lg mb-4">
          {success}
        </div>
      )}

      <div className="bg-gray-900 rounded-xl p-6">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-4">
            <h2 className="text-xl font-semibold text-white">Telegram</h2>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                ID Telegram
              </label>
              <input
                type="text"
                value={telegramId}
                onChange={(e) => setTelegramId(e.target.value.replace(/[^\d]/g, ''))}
                placeholder="123456789"
                className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-blue-500"
              />
              <p className="mt-1 text-sm text-gray-400">
                Введите ваш ID Telegram (только цифры), например: 123456789
              </p>
            </div>
          </div>

          <div className="space-y-4">
            <h2 className="text-xl font-semibold text-white">Учетные данные</h2>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Логин
              </label>
              <input
                type="text"
                value={login}
                onChange={(e) => setLogin(e.target.value)}
                className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Новый пароль
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Оставьте пустым, чтобы не менять"
                className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-blue-500"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
          >
            {isLoading ? 'Сохранение...' : 'Сохранить'}
          </button>
        </form>
      </div>
    </div>
  );
} 