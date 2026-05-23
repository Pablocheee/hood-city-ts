import { Composer, InlineKeyboard } from 'grammy';
import { PrismaClient } from '@prisma/client';
import { LIMITED_COLLECTION } from '../data/collection';
import { ENV } from '../config';
import { TonService } from '../core/ton.service';

const prisma = new PrismaClient();
export const shopHandler = new Composer();

// Команда /shop
shopHandler.command('shop', async (ctx) => {
    await renderShopList(ctx);
});

// Кнопка возврата в магазин
shopHandler.callbackQuery('back_to_shop', async (ctx) => {
    await renderShopList(ctx);
});

// Функция отрисовки витрины
async function renderShopList(ctx: any) {
    const keyboard = new InlineKeyboard();
    
    for (const [id, item] of Object.entries(LIMITED_COLLECTION)) {
        keyboard.text(`${item.emoji} ${item.name} - ${item.price} TON`, `buy_item_${id}`).row();
    }
    
    keyboard.text('🔙 В главное меню', 'main_menu');

    const message = `🏪 *Магазин TON Fashion*\n\n🔥 *Ограниченная коллекция!*\nВыбери предмет для покупки:`;

    if (ctx.callbackQuery) {
        await ctx.editMessageText(message, { parse_mode: 'Markdown', reply_markup: keyboard });
    } else {
        await ctx.reply(message, { parse_mode: 'Markdown', reply_markup: keyboard });
    }
}

// Карточка товара с кнопками оплаты
shopHandler.callbackQuery(/^buy_item_(.+)$/, async (ctx) => {
    if (!ctx.from) return;
    const itemId = ctx.match[1];
    const item = LIMITED_COLLECTION[itemId];
    if (!item) return;

    const userId = ctx.from.id;
    // Генерируем уникальный и безопасный коммент для оплаты
    const comment = TonService.generateComment(userId, itemId);
    const amountNano = item.price * 1e9; // Переводим TON в нанотонкоины для ссылок

    // Ссылки для быстрого перехода в кошелек
    const tonkeeperUrl = `ton://transfer/${ENV.RECEIVER_WALLET}?amount=${amountNano}&text=${comment}`;
    const tonwalletUrl = `https://tonwallet.me/transfer?address=${ENV.RECEIVER_WALLET}&amount=${amountNano}&comment=${comment}`;

    const keyboard = new InlineKeyboard()
        .url('📱 Открыть Tonkeeper', tonkeeperUrl).row()
        .url('📲 Открыть TON Wallet', tonwalletUrl).row()
        .text('🔍 Проверить оплату', `check_payment_${itemId}`).row()
        .text('🔙 Назад в магазин', 'back_to_shop');

    const message = `🛒 *Покупка ${item.name}*\n\n${item.emoji} *${item.name}*\n${item.description}\n🏷️ ${item.limitedInfo}\n\n💎 *Сумма к оплате:* ${item.price} TON\n\n*Для быстрой оплаты:*\n1. Нажми кнопку для своего кошелька\n2. Подтверди транзакцию\n3. Вернись и нажми 'Проверить оплату'\n\n*Система автоматически проверит оплату и выдаст предмет!*`;

    await ctx.editMessageText(message, { parse_mode: 'Markdown', reply_markup: keyboard });
});

// Проверка оплаты и выдача предмета
shopHandler.callbackQuery(/^check_payment_(.+)$/, async (ctx) => {
    if (!ctx.from) return;
    const itemId = ctx.match[1];
    const item = LIMITED_COLLECTION[itemId];
    if (!item) return;

    const userId = ctx.from.id;
    const comment = TonService.generateComment(userId, itemId);
    
    // Показываем пользователю, что процесс идет
    await ctx.answerCallbackQuery({ text: '⏳ Проверяем блокчейн TON...' });

    // Обращаемся к нашему сервису (он проверит API и базу от двойных начислений)
    const isPaid = await TonService.verifyPayment(userId, item.price, comment, 'shop_purchase');

    if (isPaid) {
        // Если оплата найдена — создаем предмет в БД
        await prisma.inventoryItem.create({
            data: {
                userId: BigInt(userId),
                itemId: itemId
            }
        });

        const keyboard = new InlineKeyboard().text('🔙 Назад в магазин', 'back_to_shop');
        await ctx.editMessageText(`🎉 *Оплата подтверждена!*\n\nТы успешно приобрел ${item.emoji} *${item.name}*!\n\n💎 Сумма: ${item.price} TON\n📦 Предмет уже добавлен в твой инвентарь!`, { parse_mode: 'Markdown', reply_markup: keyboard });
    } else {
        const keyboard = new InlineKeyboard()
            .text('🔄 Проверить еще раз', `check_payment_${itemId}`).row()
            .text('🔙 Назад', `buy_item_${itemId}`);
        
        await ctx.editMessageText(`❌ *Оплата не найдена*\n\nМы не нашли перевод на *${item.price} TON* с нужным комментарием.\n\nУбедись, что транзакция ушла. Блокчейну TON иногда нужно 1-2 минуты. Подожди немного и попробуй проверить еще раз.`, { parse_mode: 'Markdown', reply_markup: keyboard });
    }
});