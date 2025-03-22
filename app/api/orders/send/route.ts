import { NextResponse } from 'next/server';
import { getTelegramId } from '@/app/lib/db';

// Функция для экранирования специальных символов Markdown V2
function escapeMarkdownV2(text: string) {
  return text.replace(/[_*[\]()~`>#+=|{}.!-]/g, '\\$&');
}

export async function POST(request: Request) {
  try {
    const orderData = await request.json();
    
    // Получаем telegram_id админа из базы данных
    const adminTelegramId = await getTelegramId();
    if (!adminTelegramId) {
      return NextResponse.json(
        { error: 'Admin Telegram ID not found' },
        { status: 404 }
      );
    }

    // Проверяем наличие необходимых данных
    if (!orderData.items || !Array.isArray(orderData.items)) {
      throw new Error('Invalid items data');
    }

    // Форматируем список товаров
    const itemsList = orderData.items.map((item: any) => {
      // Экранируем только специальные символы в названии товара, кроме *
      const name = item.name.replace(/[[\]~`<>#=|{$}.!]/g, '\\$&');
      const quantity = item.quantity;
      const price = parseFloat(String(item.price)) || 0;
      const total = quantity * price;

      return `• ${name} - ${quantity} шт. x ${price.toLocaleString('ru-RU')} сом = ${total.toLocaleString('ru-RU')} сом`;
    }).join('\n');

    // Определяем язык общения с клиентом
    const clientLanguage = orderData.language === 'ky' ? 'Кыргызский' : 'Русский';
    
    // Экранируем имя клиента
    const clientName = (orderData.name || 'Не указано').replace(/([_*[\]()~`>#+\-=|{}.!])/g, '\\$1');
    const clientPhone = (orderData.phone || 'Не указано').replace(/([_*[\]()~`>#\-=|{}.!])/g, '\\$1');

    // Формируем сообщение без Markdown-разметки
    const message = `🛍️ Новый заказ!

👤 Клиент: ${clientName}
📞 Телефон: ${clientPhone}
📱 Тип связи: ${orderData.contactType === 'whatsapp' ? 'WhatsApp' : 'Звонок'}
🗣 Язык клиента: ${clientLanguage}

🛒 Товары:
${itemsList}

💰 Итого: ${orderData.totalSum.toLocaleString('ru-RU')} сом

📅 Дата заказа: ${new Date().toLocaleString('ru-RU')}`;

    // Проверяем наличие токена бота
    if (!process.env.TELEGRAM_BOT_TOKEN) {
      throw new Error('Telegram bot token not found');
    }

    // Отправляем сообщение в Telegram без указания parse_mode
    const telegramResponse = await fetch(
      `https://api.telegram.org/bot${process.env.TELEGRAM_BOT_TOKEN}/sendMessage`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          chat_id: adminTelegramId,
          text: message
        }),
      }
    );

    const telegramData = await telegramResponse.json();

    if (!telegramResponse.ok) {
      console.error('Telegram API Error:', telegramData);
      throw new Error(telegramData.description || 'Failed to send message to Telegram');
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error sending order:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to send order' },
      { status: 500 }
    );
  }
} 