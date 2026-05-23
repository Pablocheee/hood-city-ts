import { Composer, InlineKeyboard } from 'grammy';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();
export const marketplaceHandler = new Composer();

marketplaceHandler.callbackQuery('market_menu', async (ctx) => {
    const keyboard = new InlineKeyboard()
        .text('🛒 Купить', 'market_buy').row()
        .text('💰 Продать', 'market_sell').row()
        .text('🔙 Назад', 'main_menu');

    await ctx.editMessageText('🏪 *Маркетплейс*\nКомиссия: 5%', {
        parse_mode: 'Markdown',
        reply_markup: keyboard
    });
});

marketplaceHandler.callbackQuery('main_menu', async (ctx) => {
    const keyboard = new InlineKeyboard()
        .text('🏪 Маркетплейс', 'market_menu');

    await ctx.editMessageText('Добро пожаловать в Hood City! Выбери действие:', {
        reply_markup: keyboard
    });
});